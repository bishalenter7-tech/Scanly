import { collection, doc, setDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AnalysisResult } from '../types/analysis';

export const saveScanToFirestore = async (userId: string, scanId: string, result: AnalysisResult, imageBase64?: string) => {
  try {
    const docRef = doc(db, 'users', userId, 'scans', scanId);
    await setDoc(docRef, {
      id: scanId,
      result,
      imageBase64: imageBase64 || null,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving to Firestore", error);
  }
};

export const getScansFromFirestore = async (userId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'scans'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting scans from Firestore", error);
    return [];
  }
};

export const clearScansFromFirestore = async (userId: string) => {
  try {
    const q = query(collection(db, 'users', userId, 'scans'));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error clearing scans from Firestore", error);
  }
}
