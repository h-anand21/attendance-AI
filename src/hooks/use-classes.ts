
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
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
      if (querySnapshot.empty) {
        setLoading(true);
        console.log('No classes found, seeding initial data...');
        const batch = writeBatch(db);
        
        initialClassesData.forEach(classData => {
            const classRef = doc(db, 'users', user.uid, 'classes', classData.id);
            const studentCount = (initialStudentsData[classData.id] || []).length;
            batch.set(classRef, { 
              name: classData.name, 
              section: classData.section,
              studentCount: studentCount
            });
        });

        Object.entries(initialStudentsData).forEach(([classId, students]) => {
            students.forEach(studentData => {
                const studentRef = doc(collection(db, 'users', user.uid, 'students'));
                batch.set(studentRef, {
                    ...studentData,
                    id: studentRef.id,
                    classId: classId,
                });
            });
        });

        await batch.commit();
        console.log('Initial data seeded.');
        setLoading(false);
      } else {
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
        studentCount: 0 
      });
    } catch (error) {
      console.error("Error adding class: ", error);
    }
  }, [user]);

  return { classes, addClass, loading };
}
