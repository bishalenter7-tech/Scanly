import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
  hasSeenSplash: boolean;
  setHasSeenSplash: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: '',
      setLanguage: (lang) => set({ language: lang }),
      hasSeenSplash: false,
      setHasSeenSplash: (val) => set({ hasSeenSplash: val }),
    }),
    {
      name: 'app-settings',
    }
  )
);
