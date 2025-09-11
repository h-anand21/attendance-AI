
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  writeBatch,
  where,
  getDocs,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AttendanceRecord } from '@/types';
import { useAuth } from './use-auth';

// Helper to get date string in YYYY-MM-DD format from a Date object, respecting local timezone.
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAttendanceRecords([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'attendance'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map(
          (doc) => ({ ...doc.data() }) as AttendanceRecord
        );
        setAttendanceRecords(records);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching attendance records: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addAttendanceRecords = useCallback(
    async (newRecords: Omit<AttendanceRecord, 'userId'| 'id'>[]) => {
      if (!user || newRecords.length === 0) return;

      try {
        const batch = writeBatch(db);
        const attendanceCollection = collection(
          db,
          'users',
          user.uid,
          'attendance'
        );
        
        // Use the local date for all records in this batch
        const localDateString = toLocalDateString(new Date());

        for (const record of newRecords) {
           const recordWithLocalDate = { ...record, date: localDateString };
           
          const q = query(
            attendanceCollection,
            where('studentId', '==', recordWithLocalDate.studentId),
            where('date', '==', recordWithLocalDate.date),
            where('classId', '==', recordWithLocalDate.classId)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            batch.update(existingDoc.ref, { status: recordWithLocalDate.status });
          } else {
             const newDocRef = doc(attendanceCollection);
             const newRecord: AttendanceRecord = {
                id: newDocRef.id,
                ...recordWithLocalDate,
                userId: user.uid,
             } 
             batch.set(newDocRef, newRecord);
          }
        }

        await batch.commit();
      } catch (error) {
        console.error('Failed to save attendance to Firestore', error);
      }
    },
    [user]
  );

  return { attendanceRecords, addAttendanceRecords, loading };
}
