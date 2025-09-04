
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
  DocumentReference,
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

    const classesCollection = collection(db, 'users', user.uid, 'classes');
    const q = query(classesCollection);

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      if (querySnapshot.empty && user) {
        // Check if data is already being seeded to prevent race conditions
        const seedingFlag = `seeding_for_${user.uid}`;
        if (sessionStorage.getItem(seedingFlag)) {
            return;
        }
        sessionStorage.setItem(seedingFlag, 'true');

        setLoading(true);
        console.log('No classes found, seeding initial data...');
        try {
            const batch = writeBatch(db);
            const studentsCollection = collection(db, 'users', user.uid, 'students');

            for (const classData of initialClassesData) {
                const classRef = doc(classesCollection, classData.id);
                const studentCount = (initialStudentsData[classData.id] || []).length;
                
                batch.set(classRef, { 
                  name: classData.name, 
                  section: classData.section,
                  studentCount: studentCount,
                  createdAt: new Date().toISOString(),
                });

                const studentsForClass = initialStudentsData[classData.id] || [];
                studentsForClass.forEach(studentData => {
                    const studentRef = doc(studentsCollection); // Auto-generate ID
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
            setLoading(false);
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
      return {
        ...newClassData,
        id: docRef.id,
        studentCount: 0,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error adding class: ", error);
      return null;
    }
  }, [user]);

  return { classes, addClass, loading };
}
