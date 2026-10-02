import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Class } from '../types';
import { useAuth } from './useAuth';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const classesCollectionRef = collection(db, 'users', user.uid, 'classes');
    const q = query(classesCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedClasses = querySnapshot.docs.map(doc => ({
        ...doc.data(),
      } as Class));

      setClasses(fetchedClasses);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching classes: ', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addClass = useCallback(async (newClassData: Omit<Class, 'id' | 'studentCount' | 'createdAt'>): Promise<void> => {
    if (!user) return;
    try {
      const classesCollection = collection(db, 'users', user.uid, 'classes');
      const classDocRef = doc(classesCollection);

      const newClass: Class = {
        id: classDocRef.id,
        ...newClassData,
        studentCount: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(classDocRef, newClass);
    } catch (error) {
      console.error('Error adding class: ', error);
    }
  }, [user]);

  return { classes, addClass, loading };
}
