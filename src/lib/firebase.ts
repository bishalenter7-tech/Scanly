import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Add type definition for import.meta.env
declare global {
  var __VITE_FIREBASE_API_KEY: string;
  var __VITE_FIREBASE_AUTH_DOMAIN: string;
  var __VITE_FIREBASE_PROJECT_ID: string;
  var __VITE_FIREBASE_STORAGE_BUCKET: string;
  var __VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  var __VITE_FIREBASE_APP_ID: string;
}

// 1. Load configuration from secure environment variables
const firebaseConfig = {
apiKey: __VITE_FIREBASE_API_KEY,
authDomain: __VITE_FIREBASE_AUTH_DOMAIN,
projectId: __VITE_FIREBASE_PROJECT_ID,
storageBucket: __VITE_FIREBASE_STORAGE_BUCKET,
messagingSenderId: __VITE_FIREBASE_MESSAGING_SENDER_ID,
appId: __VITE_FIREBASE_APP_ID,
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
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();