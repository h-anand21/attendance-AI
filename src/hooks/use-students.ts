
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/types';
import { useAuth } from './use-auth';
import { useClasses } from './use-classes';
import { students as initialStudentsData } from '@/lib/data';

export function useStudents() {
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { classes } = useClasses();

  useEffect(() => {
    if (!user || classes.length === 0) {
      setStudentsByClass({});
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribes = classes.map(c => {
      const q = query(collection(db, 'users', user.uid, 'classes', c.id, 'students'));
      return onSnapshot(q, (snapshot) => {
        const classStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setStudentsByClass(prev => ({ ...prev, [c.id]: classStudents }));
      }, (error) => {
        console.error(`Error fetching students for class ${c.id}: `, error);
      });
    });

    // This is a workaround to signal loading is done after initial snapshot loads
    const timer = setTimeout(() => setLoading(false), 1500); 

    return () => {
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(timer);
    }
  }, [user, classes]);

  const addStudent = useCallback(async (student: Omit<Student, 'id'>, classId: string) => {
    if (!user) return;

    const classRef = doc(db, 'users', user.uid, 'classes', classId);
    const studentsRef = collection(db, 'users', user.uid, 'classes', classId, 'students');
    const newStudentRef = doc(studentsRef); // Firestore generates a unique ID
    
    try {
       await runTransaction(db, async (transaction) => {
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
          throw new Error("Class document does not exist!");
        }
        
        // Add new student with the generated unique ID
        transaction.set(newStudentRef, { ...student, id: newStudentRef.id });
        
        // Atomically increment student count
        const newStudentCount = (classDoc.data().studentCount || 0) + 1;
        transaction.update(classRef, { studentCount: newStudentCount });
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
    }
  }, [user]);
  
  const getStudentsForClass = useCallback((classId: string) => {
    return studentsByClass[classId] || [];
  }, [studentsByClass]);


  return { studentsByClass, addStudent, getStudentsForClass, loading };
}
