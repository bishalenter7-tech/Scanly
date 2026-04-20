import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult } from '../types/analysis';
import { saveScanToFirestore, clearScansFromFirestore, getScansFromFirestore } from '../lib/firestore';
import { auth } from '../lib/firebase';

export interface ScanHistoryItem {
  id: string;
  date: string;
  result: AnalysisResult;
  imageBase64?: string;
}

export interface CompactScanItem {
  id: string;
  timestamp: number;
  productName: string;
  safetyScore: number;
  safetyVerdict: string;
  category: string;
  imageUrl?: string;
}

interface ScanStore {
  language: string;
  imagePreview: string | null;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  history: ScanHistoryItem[];
  scanHistory: CompactScanItem[];
  freeScansLimit: number;
  lastResetDate: number;
  setLanguage: (lang: string) => void;
  setImage: (image: string | null) => void;
  setAnalyzing: (loading: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  saveToHistory: (result: AnalysisResult, imageBase64?: string) => void;
  clearHistory: () => void;
  removeOldHistory: () => void;
  syncFromFirebase: () => Promise<void>;
  checkAndResetScans: () => boolean;
  useScan: () => void;
  rewardScan: () => void;
  addScanToHistory: (scanData: Omit<CompactScanItem, 'id' | 'timestamp'>) => void;
  cleanOldHistory: () => void;
  clearAllHistory: () => void;
}

export const useScanStore = create<ScanStore>()(
  persist(
    (set, get) => ({
      language: 'English',
      imagePreview: null,
      isAnalyzing: false,
      result: null,
      error: null,
      history: [],
      scanHistory: [],
      freeScansLimit: 2,
      lastResetDate: Number(Date.now()),
      setLanguage: (lang) => set({ language: lang }),
      setImage: (image) => set({ imagePreview: image }),
      setAnalyzing: (loading) => set({ isAnalyzing: loading }),
      setResult: (result) => set({ result }),
      setError: (error) => set({ error }),
      reset: () => set({ imagePreview: null, isAnalyzing: false, result: null, error: null }),
      checkAndResetScans: () => {
        const { lastResetDate, freeScansLimit } = get();
        const now = Number(Date.now());
        const twentyFourHours = 86400000;
        
        if (now - lastResetDate >= twentyFourHours) {
          set({ freeScansLimit: 2, lastResetDate: now });
          return true;
        }
        return freeScansLimit > 0;
      },
      useScan: () => {
        const { freeScansLimit } = get();
        set({ freeScansLimit: Math.max(0, freeScansLimit - 1) });
      },
      rewardScan: () => {
        const { freeScansLimit } = get();
        set({ freeScansLimit: freeScansLimit + 1 });
      },
      addScanToHistory: (scanData) => {
        const newItem: CompactScanItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          productName: scanData.productName,
          safetyScore: scanData.safetyScore,
          safetyVerdict: scanData.safetyVerdict,
          category: scanData.category,
          imageUrl: scanData.imageUrl,
        };
        set((state) => ({ scanHistory: [newItem, ...state.scanHistory] }));
        // Clean old history after adding new item
        get().cleanOldHistory();
      },
      cleanOldHistory: () => {
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        set((state) => ({
          scanHistory: state.scanHistory.filter((item) => now - item.timestamp < SEVEN_DAYS),
        }));
      },
      clearAllHistory: () => {
        set({ scanHistory: [], history: [] });
        if (auth.currentUser) {
          clearScansFromFirestore(auth.currentUser.uid);
        }
      },
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
      partialize: (state) => ({ 
        history: state.history,
        scanHistory: state.scanHistory,
        freeScansLimit: state.freeScansLimit,
        lastResetDate: state.lastResetDate
      }),
    }
  )
);
