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
  console.warn(
    `[Firebase] Environment variables not explicitly provided in .env: ${missingVars.join(', ')}. ` +
    'Falling back to canonical project credentials.'
  );
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBA1CC4SXXtWM9UpU1XkAiBFr0RIgrPwGk',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'tangent-rpg-dbm.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'tangent-rpg-dbm',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'tangent-rpg-dbm.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '559983787369',
  appId: env.VITE_FIREBASE_APP_ID || '1:559983787369:web:4783a164588bc0bcd211f8',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-JQY5WY1LJ5',
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
