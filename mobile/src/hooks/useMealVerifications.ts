import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MealVerification } from '../types';
import { useAuth } from './useAuth';

export function useMealVerifications() {
  const [verifications, setVerifications] = useState<MealVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setVerifications([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'meal_verifications'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map(
          (doc) => ({ ...doc.data() }) as MealVerification
        );
        setVerifications(records);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching meal verifications: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addMealVerification = useCallback(
    async (verificationData: Omit<MealVerification, 'id' | 'verifiedBy' | 'verifiedAt'>): Promise<boolean> => {
      if (!user) return false;

      const { studentId, date, source, note } = verificationData;
      const verificationsCollection = collection(db, 'users', user.uid, 'meal_verifications');

      const q = query(
        verificationsCollection,
        where('studentId', '==', studentId),
        where('date', '==', date)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return false; // Already verified
      }

      try {
        const newDocRef = doc(verificationsCollection);
        const newVerification: MealVerification = {
          id: newDocRef.id,
          studentId,
          date,
          source,
          note: note || '',
          verifiedBy: user.uid,
          verifiedAt: new Date().toISOString(),
        };
        await setDoc(newDocRef, newVerification);
        return true;
      } catch (error) {
        console.error('Failed to save meal verification:', error);
        return false;
      }
    },
    [user]
  );

  return { verifications, addMealVerification, loading };
}
