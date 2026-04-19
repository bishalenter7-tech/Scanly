import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, GoogleAuthProvider, Auth, browserPopupRedirectResolver } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Type augmentation for Vite environment variables (correct TypeScript approach)
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
  }
}

// 1. Load configuration from secure environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 2. Validate configuration to prevent silent crashes in production
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("🔥 CRITICAL: Firebase environment variables are missing. Check your .env file or Vercel Environment settings.");
}

// 3. Initialize Firebase (Singleton pattern to prevent re-initialization errors in React StrictMode)
export const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// 4. Export services
export const auth: Auth = initializeAuth(app, {
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();