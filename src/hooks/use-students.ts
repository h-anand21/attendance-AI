'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Student } from '@/types';
import { students as initialStudentsData } from '@/lib/data';

const STUDENT_STORAGE_KEY = 'attendease_students';

export function useStudents() {
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (storedStudents) {
        setStudentsByClass(JSON.parse(storedStudents));
      } else {
        // If nothing is in local storage, use the initial mock data
        setStudentsByClass(initialStudentsData);
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(initialStudentsData));
      }
    } catch (error) {
      console.error("Failed to read students from localStorage", error);
      setStudentsByClass(initialStudentsData);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, 'id'>, classId: string) => {
    setStudentsByClass(prev => {
      const classPrefix = classId.split('-')[0].toUpperCase();
      const newId = `${classPrefix}-${Date.now()}`;
      const newStudent = { ...student, id: newId };

      const updatedClassStudents = [...(prev[classId] || []), newStudent];
      const newState = { ...prev, [classId]: updatedClassStudents };
      
      try {
        localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(newState));
      } catch (error) {
        console.error("Failed to save student to localStorage", error);
      }

      return newState;
    });
  }, []);
  
  const getStudentsForClass = useCallback((classId: string) => {
    return studentsByClass[classId] || [];
  }, [studentsByClass]);


  return { studentsByClass, addStudent, getStudentsForClass, loading };
}
