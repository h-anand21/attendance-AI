
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Teacher } from '@/types';
import { useAuth } from './use-auth';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTeachers([]);
      setLoading(false);
      return;
    }

    const teachersCollectionRef = collection(db, 'users', user.uid, 'teachers');
    const q = query(teachersCollectionRef, orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTeachers = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Teacher
        );
        setTeachers(fetchedTeachers);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching teachers: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTeacher = useCallback(async (newTeacherData: Omit<Teacher, 'id'>) => {
    if (!user) return;
    try {
      const teachersCollection = collection(db, 'users', user.uid, 'teachers');
      const teacherDocRef = doc(teachersCollection);
      
      const finalTeacherData: Teacher = {
        id: teacherDocRef.id,
        ...newTeacherData,
      }

      await setDoc(teacherDocRef, finalTeacherData);

    } catch (error) {
      console.error('Error adding teacher: ', error);
    }
  }, [user]);

  return { teachers, addTeacher, loading };
}
