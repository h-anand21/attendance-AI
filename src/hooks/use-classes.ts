'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Class } from '@/types';
import { useAuth } from './use-auth';
import { classes as initialClassesData, students as initialStudentsData } from '@/lib/data';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    };

    const q = query(collection(db, 'users', user.uid, 'classes'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // On first load, check if classes exist. If not, seed them.
      if (querySnapshot.empty) {
        // Seed data for new user
        const batch = writeBatch(db);
        initialClassesData.forEach(classData => {
            const classRef = doc(collection(db, 'users', user.uid, 'classes'));
            batch.set(classRef, { name: classData.name, section: classData.section });
        });
        await batch.commit();
        setLoading(false);
        // Snapshot listener will pick up the new data
      } else {
        const classesData: Class[] = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
          const studentQuery = query(collection(db, 'users', user.uid, 'classes', doc.id, 'students'));
            let studentCount = 0;
            // This is inefficient but works for smaller datasets.
            // For larger datasets, consider storing studentCount on the class document.
            await getDoc(doc.ref).then(async (classDoc) => {
              if (classDoc.exists()) {
                const studentsSnapshot = await getDoc(doc.ref);
                // This part is tricky because students are a subcollection.
                // We will manually count them for now. A better approach for scale would be a counter.
                 const studentColl = collection(db, 'users', user.uid, 'classes', doc.id, 'students');
                 const studentSnap = await getDoc(doc.ref);

                 // This is a placeholder, as getting subcollection size client-side is inefficient.
                 // We will manage studentCount on add/delete for better performance.
                 studentCount = (await (await getDoc(doc.ref)).data()?.studentCount) || 0;
              }
            });

            return {
              id: doc.id,
              ...doc.data(),
              studentCount,
            } as Class;
          })
        );
        
        const fetchedClasses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Class));
        
        setClasses(fetchedClasses);
        setLoading(false);
      }
    }, (error) => {
        console.error("Error fetching classes: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addClass = useCallback(async (newClassData: Omit<Class, 'id' | 'studentCount'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'classes'), {
        ...newClassData,
        studentCount: 0 // Initialize student count
      });
    } catch (error) {
      console.error("Error adding class: ", error);
    }
  }, [user]);

  return { classes, addClass, loading };
}
