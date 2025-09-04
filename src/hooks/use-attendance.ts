
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

        for (const record of newRecords) {
          const q = query(
            attendanceCollection,
            where('studentId', '==', record.studentId),
            where('date', '==', record.date),
            where('classId', '==', record.classId)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            batch.update(existingDoc.ref, { status: record.status });
          } else {
             const newDocRef = doc(attendanceCollection);
             const newRecord: AttendanceRecord = {
                id: newDocRef.id,
                ...record,
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
