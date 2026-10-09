import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
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

const isNodeTestEnv = typeof window === 'undefined' && !env.VITE_FIREBASE_API_KEY;

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

// Analytics — only initializes safely if supported and not blocked by client extensions
export let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
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
