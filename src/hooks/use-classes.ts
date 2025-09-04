
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  writeBatch,
  getDocs,
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

    const classesCollectionRef = collection(db, 'users', user.uid, 'classes');
    const q = query(classesCollectionRef);

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const seedingFlag = `seeding_for_${user.uid}`;
      if (querySnapshot.empty && !sessionStorage.getItem(seedingFlag)) {
        sessionStorage.setItem(seedingFlag, 'true');
        setLoading(true);

        console.log('No classes found, seeding initial data...');
        try {
            const batch = writeBatch(db);
            const studentsCollectionRef = collection(db, 'users', user.uid, 'students');

            for (const classData of initialClassesData) {
                const classRef = doc(classesCollectionRef, classData.id);
                const studentsForClass = initialStudentsData[classData.id] || [];
                const studentCount = studentsForClass.length;

                batch.set(classRef, { 
                  name: classData.name, 
                  section: classData.section,
                  studentCount: studentCount,
                  createdAt: new Date().toISOString(),
                });

                studentsForClass.forEach(studentData => {
                    // Let firestore generate a new ID
                    const studentRef = doc(studentsCollectionRef);
                    batch.set(studentRef, {
                        ...studentData,
                        id: studentRef.id,
                        classId: classData.id,
                    });
                });
            }
            await batch.commit();
            console.log('Initial data seeded.');
        } catch (error) {
            console.error("Error seeding data:", error);
        } finally {
            // Let the snapshot listener update the state naturally
            sessionStorage.removeItem(seedingFlag);
        }
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

  const addClass = useCallback(async (newClassData: Omit<Class, 'id' | 'studentCount' | 'createdAt'>): Promise<Class | null> => {
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'classes'), {
        ...newClassData,
        studentCount: 0,
        createdAt: new Date().toISOString(),
      });
      const newClass: Class = {
        id: docRef.id,
        ...newClassData,
        studentCount: 0,
        createdAt: new Date().toISOString(),
      };
      return newClass;
    } catch (error) {
      console.error("Error adding class: ", error);
      return null;
    }
  }, [user]);

  return { classes, addClass, loading };
}
