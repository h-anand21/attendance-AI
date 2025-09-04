
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
  setDoc,
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
            
            // A map to hold the new Firestore-generated IDs for classes
            const classIdMap = new Map<string, string>();

            for (const classData of initialClassesData) {
                // Let Firestore generate a new ID for the class
                const newClassRef = doc(classesCollectionRef);
                classIdMap.set(classData.id, newClassRef.id); // Map old static ID to new Firestore ID
                
                const studentsForClass = initialStudentsData[classData.id] || [];
                const studentCount = studentsForClass.length;

                batch.set(newClassRef, {
                  id: newClassRef.id, 
                  name: classData.name, 
                  section: classData.section,
                  studentCount: studentCount,
                  createdAt: new Date().toISOString(),
                });

                for (const studentData of studentsForClass) {
                    // Let firestore generate a new ID for the student
                    const newStudentRef = doc(studentsCollectionRef);
                    batch.set(newStudentRef, {
                        ...studentData,
                        id: newStudentRef.id,
                        classId: newClassRef.id, // Use the new class ID
                    });
                }
            }
            await batch.commit();
            console.log('Initial data seeded.');
        } catch (error) {
            console.error("Error seeding data:", error);
        } finally {
            // Unset the flag in case seeding fails, allowing a retry
            sessionStorage.removeItem(seedingFlag);
        }
      } else {
        const fetchedClasses = querySnapshot.docs.map(doc => ({
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
      const classesCollection = collection(db, 'users', user.uid, 'classes');
      const classDocRef = doc(classesCollection); // Let Firestore generate ID

      const newClass: Class = {
        id: classDocRef.id,
        ...newClassData,
        studentCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(classDocRef, newClass);
      
      return newClass;
    } catch (error) {
      console.error("Error adding class: ", error);
      return null;
    }
  }, [user]);

  return { classes, addClass, loading };
}
