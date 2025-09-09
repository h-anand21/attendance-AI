
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  writeBatch,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MealVerification } from '@/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export function useMealVerifications() {
  const [verifications, setVerifications] = useState<MealVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
    async (verificationData: Omit<MealVerification, 'id' | 'verifiedBy' | 'verifiedAt'>) => {
      if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to verify meals.',
        });
        return false;
      }

      const { studentId, date, source, note } = verificationData;
      
      const verificationsCollection = collection(db, 'users', user.uid, 'meal_verifications');
      
      // Check if a verification for this student on this date already exists
      const q = query(
        verificationsCollection,
        where('studentId', '==', studentId),
        where('date', '==', date)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: 'Already Verified',
          description: 'A meal has already been verified for this student today.',
        });
        return false;
      }

      // If no existing record, create a new one
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
        toast({
          title: 'Verification Successful',
          description: `Meal confirmed for student.`,
        });
        return true;
      } catch (error) {
        console.error('Failed to save meal verification:', error);
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'An error occurred while saving the record.',
        });
        return false;
      }
    },
    [user, toast]
  );

  return { verifications, addMealVerification, loading };
}
