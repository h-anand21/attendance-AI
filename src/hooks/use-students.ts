
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/types';
import { useAuth } from './use-auth';

export function useStudents() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAllStudents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(collection(db, 'users', user.uid, 'students'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => doc.data() as Student);
      setAllStudents(students);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching students: `, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const studentsByClass = useMemo(() => {
    return allStudents.reduce((acc, student) => {
      const classId = student.classId || 'unassigned';
      if (!acc[classId]) {
        acc[classId] = [];
      }
      acc[classId].push(student);
      return acc;
    }, {} as Record<string, Student[]>);
  }, [allStudents]);

  const addStudent = useCallback(async (student: Omit<Student, 'id' | 'classId'>, classId: string) => {
    if (!user || !classId) return;

    const classRef = doc(db, 'users', user.uid, 'classes', classId);
    
    try {
       await runTransaction(db, async (transaction) => {
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
          throw new Error("Class document does not exist!");
        }
        
        const newStudentRef = doc(collection(db, 'users', user.uid, 'students'));
        
        const newStudent: Student = {
          ...student,
          id: newStudentRef.id,
          classId,
        };

        transaction.set(newStudentRef, newStudent);
        
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
