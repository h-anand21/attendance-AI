
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
      // On first load, check if classes exist. If not, seed them.
      if (querySnapshot.empty) {
        // Seed data for new user
        const batch = writeBatch(db);
        initialClassesData.forEach(classData => {
            const classRef = doc(db, 'users', user.uid, 'classes', classData.id);
            batch.set(classRef, { 
              name: classData.name, 
              section: classData.section,
              studentCount: (initialStudentsData[classData.id] || []).length 
            });
            
            // Seed students for this class
            const studentsForClass = initialStudentsData[classData.id] || [];
            studentsForClass.forEach(studentData => {
                const studentRef = doc(db, 'users', user.uid, 'classes', classData.id, 'students', studentData.id);
                batch.set(studentRef, {
                    name: studentData.name,
                    avatar: studentData.avatar,
                    id: studentData.id
                });
            });
        });
        await batch.commit();
        setLoading(false);
        // Snapshot listener will pick up the new data
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
        studentCount: 0 // Initialize student count
      });
    } catch (error) {
      console.error("Error adding class: ", error);
    }
  }, [user]);

  return { classes, addClass, loading };
}
