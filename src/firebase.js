import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tangent-rpg-dbm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tangent-rpg-dbm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tangent-rpg-dbm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "559983787369",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:559983787369:web:4783a164588bc0bcd211f8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JQY5WY1LJ5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics — only initializes in browser environments (not SSR/Node)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

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
