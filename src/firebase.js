import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, initializeFirestore, setLogLevel, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Validate that all required Firebase env vars are present at startup.
// Vite replaces import.meta.env values at build time — missing vars become undefined.
const REQUIRED_FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const missingVars = REQUIRED_FIREBASE_VARS.filter(key => !env[key]);
if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error(
    `[Firebase] Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Copy .env.example to .env and fill in your Firebase project credentials.'
  );
}

const isNodeTestEnv = (typeof window === 'undefined' || typeof process !== 'undefined') && !env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || (isNodeTestEnv ? 'AIzaSyDummyKeyForTestingNodeEnv000' : undefined),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (isNodeTestEnv ? 'tangent-sf-rp.firebaseapp.com' : undefined),
  projectId: env.VITE_FIREBASE_PROJECT_ID || (isNodeTestEnv ? 'tangent-sf-rp' : undefined),
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (isNodeTestEnv ? 'tangent-sf-rp.appspot.com' : undefined),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isNodeTestEnv ? '1234567890' : undefined),
  appId: env.VITE_FIREBASE_APP_ID || (isNodeTestEnv ? '1:1234567890:web:abcdef123456' : undefined),
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const storage = getStorage(app);

// Silence internal @firebase/firestore transport backoff spam in the browser console
try {
  setLogLevel('silent');
} catch {}

const QUOTA_EXHAUSTED_SESSION_KEY = 'tangent_firestore_quota_exhausted_until';
const QUOTA_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
let quotaExhaustedInMemory = false;

export const isFirestoreQuotaExhausted = () => {
  if (quotaExhaustedInMemory) return true;
  try {
    if (typeof sessionStorage !== 'undefined') {
      const until = Number(sessionStorage.getItem(QUOTA_EXHAUSTED_SESSION_KEY) || 0);
      if (until > Date.now()) {
        quotaExhaustedInMemory = true;
        return true;
      }
    }
  } catch {}
  return false;
};

export const handleFirestoreQuotaError = (err) => {
  const msg = String(err?.message || err?.code || '').toLowerCase();
  if (err?.code === 'resource-exhausted' || msg.includes('resource-exhausted') || msg.includes('quota exceeded')) {
    if (!quotaExhaustedInMemory) {
      quotaExhaustedInMemory = true;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(QUOTA_EXHAUSTED_SESSION_KEY, String(Date.now() + QUOTA_COOLDOWN_MS));
        }
      } catch {}
      try {
        disableNetwork(db).catch(() => {});
      } catch {}
    }
    return true;
  }
  return false;
};

if (typeof window !== 'undefined' && isFirestoreQuotaExhausted()) {
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
}

// Analytics — only initializes in production (not localhost) if supported and not blocked by client extensions
export let analytics = null;
const isLocalhost = typeof window !== 'undefined' && (
  window.location?.hostname === 'localhost' ||
  window.location?.hostname === '127.0.0.1'
);
if (typeof window !== 'undefined' && !isLocalhost && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        // Suppress expected ad-blocker network block errors
      }
    }
  }).catch(() => {});
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
