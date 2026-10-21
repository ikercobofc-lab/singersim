import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyPlaceholderKeyForSingerSimulatorDemo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "singersim-4ca37.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "singersim-4ca37",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "singersim-4ca37.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export const isFirebaseConfigured = (): boolean => {
  return (
    !!import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes("PlaceholderKey")
  );
};

export { app, auth, db };
