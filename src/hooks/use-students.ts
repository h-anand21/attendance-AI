
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/types';
import { useAuth } from './use-auth';
import QRCode from 'qrcode';


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

  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'classId' | 'qrCode'>, classId: string): Promise<string | null> => {
    if (!user || !classId) return null;

    const classRef = doc(db, 'users', user.uid, 'classes', classId);
    const newStudentRef = doc(collection(db, 'users', user.uid, 'students'));

    try {
       await runTransaction(db, async (transaction) => {
        const classDoc = await transaction.get(classRef);
        if (!classDoc.exists()) {
          throw new Error("Class document does not exist!");
        }
        
        // 1. Create student without QR code first to get the ID
        const newStudent: Omit<Student, 'qrCode'> = {
          ...studentData,
          id: newStudentRef.id,
          classId,
        };
        transaction.set(newStudentRef, newStudent);
        
        const newStudentCount = (classDoc.data().studentCount || 0) + 1;
        transaction.update(classRef, { studentCount: newStudentCount });
      });

      // 2. After transaction, generate QR code with the final ID
       const qrCodeDataUrl = await QRCode.toDataURL(newStudentRef.id, {
          errorCorrectionLevel: 'H',
          type: 'image/jpeg',
          width: 300,
      });

      // 3. Update the student document with the generated QR code
      await updateDoc(newStudentRef, { qrCode: qrCodeDataUrl });
      
      return newStudentRef.id;

    } catch (e) {
      console.error("Transaction or QR code update failed: ", e);
      return null;
    }
  }, [user]);
  
  const getStudentsForClass = useCallback((classId: string) => {
    return studentsByClass[classId] || [];
  }, [studentsByClass]);


  return { studentsByClass, addStudent, getStudentsForClass, loading };
}

    