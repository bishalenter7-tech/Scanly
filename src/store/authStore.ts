import { create } from 'zustand';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { useScanStore } from './scanStore';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (displayName: string, photoURL: string) => Promise<void>;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  loginWithGoogle: async () => {
    try {
      set({ error: null });
      
      // Use popup authentication for all devices (more reliable than redirect on mobile)
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        setTimeout(() => useScanStore.getState().syncFromFirebase(), 500);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('auth/cancelled-popup-request')) {
         // Silently ignore when user cancels the popup
         return;
      } else if (error.message && error.message.includes('auth/unauthorized-domain')) {
         set({ error: "Please open the app in a new window, or add this URL to your Authorized Domains in the Firebase console." });
      } else if (error.message && error.message.includes('API key not valid')) {
         set({ error: "Firebase is not configured perfectly. Please check your credentials!" });
      } else if (error.message && error.message.includes('operation-not-allowed')) {
         set({ error: "Google Sign-In is disabled. You MUST enable it in your Firebase Console > Authentication > Sign-in Method." });
      } else {
         set({ error: `Login Failed: ${error.message}` });
      }
      console.error("Login Error:", error);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
      // clear local state to prevent mixing history
      useScanStore.getState().clearHistory();
    } catch (error: any) {
      console.error("Logout Error:", error);
    }
  },
  updateProfileData: async (displayName, photoURL) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        // Clone the object to trigger re-renders natively inside react component observing user
        set({ user: Object.assign({}, auth.currentUser) as User });
      }
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      throw error;
    }
  },
  initAuthListener: () => {
    // Set up auth state listener to handle login state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
      if (user) {
        console.log("User logged in:", user.uid);
        useScanStore.getState().syncFromFirebase();
      } else {
        console.log("User logged out");
      }
    });
    
    return unsubscribe;
  }
}));