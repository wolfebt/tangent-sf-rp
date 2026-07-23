import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBA1CC4SXXtWM9UpU1XkAiBFr0RIgrPwGk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tangent-rpg-dbm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tangent-rpg-dbm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tangent-rpg-dbm.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "559983787369",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:559983787369:web:d6f3b87daaa82b23d211f8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-G6NC09PXPC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
