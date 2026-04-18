import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult } from '../types/analysis';
import { saveScanToFirestore, clearScansFromFirestore, getScansFromFirestore } from '../lib/firestore';
import { auth } from '../lib/firebase';

export interface ScanHistoryItem {
  id: string;
  date: string;
  result: AnalysisResult;
  imageBase64?: string; // Stored to preserve history images natively
}

interface ScanStore {
  imagePreview: string | null;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  history: ScanHistoryItem[];
  setImage: (image: string | null) => void;
  setAnalyzing: (loading: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  saveToHistory: (result: AnalysisResult, imageBase64?: string) => void;
  clearHistory: () => void;
  removeOldHistory: () => void;
  syncFromFirebase: () => Promise<void>;
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set, get) => ({
      imagePreview: null,
      isAnalyzing: false,
      result: null,
      error: null,
      history: [],
      setImage: (image) => set({ imagePreview: image }),
      setAnalyzing: (loading) => set({ isAnalyzing: loading }),
      setResult: (result) => set({ result }),
      setError: (error) => set({ error }),
      reset: () => set({ imagePreview: null, isAnalyzing: false, result: null, error: null }),
      saveToHistory: (result, imageBase64?) => {
        const id = crypto.randomUUID();
        const date = new Date().toISOString();
        const newItem: ScanHistoryItem = { id, date, result, imageBase64 };
        set((state) => ({ history: [newItem, ...state.history] }));
        
        // Backup to firestore if logged in
        if (auth.currentUser) {
           saveScanToFirestore(auth.currentUser.uid, id, result, imageBase64);
        }
      },
      clearHistory: () => {
        set({ history: [] });
        if (auth.currentUser) {
           clearScansFromFirestore(auth.currentUser.uid);
        }
      },
      removeOldHistory: () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        set((state) => ({
          history: state.history.filter((item) => new Date(item.date) > sevenDaysAgo),
        }));
      },
      syncFromFirebase: async () => {
         if (auth.currentUser) {
            const scans = await getScansFromFirestore(auth.currentUser.uid);
            if (scans.length > 0) {
               const mappedScans: ScanHistoryItem[] = scans.map(s => ({
                  id: s.id,
                  result: s.result,
                  date: s.createdAt,
                  imageBase64: s.imageBase64
               }));
               set({ history: mappedScans });
            }
         }
      }
    }),
    {
      name: 'truthscan-history-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
