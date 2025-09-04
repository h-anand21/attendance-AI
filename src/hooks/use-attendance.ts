'use client';

import { useState, useEffect, useCallback } from 'react';
import { collectionGroup, query, onSnapshot, writeBatch, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AttendanceRecord } from '@/types';
import { useAuth } from './use-auth';

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        setAttendanceRecords([]);
        setLoading(false);
        return;
    }

    const q = query(collectionGroup(db, 'attendance'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({ ...doc.data() }) as AttendanceRecord);
        setAttendanceRecords(records);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching attendance records: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addAttendanceRecords = useCallback(async (newRecords: Omit<AttendanceRecord, 'userId'>[]) => {
    if (!user || newRecords.length === 0) return;

    try {
        const batch = writeBatch(db);
        
        // In Firestore, we can just overwrite documents to update them.
        // We'll create a unique ID for each record to ensure this.
        newRecords.forEach(record => {
            const recordId = `${record.classId}_${record.date}_${record.studentId}`;
            const recordRef = doc(db, 'users', user.uid, 'attendance', recordId);
            batch.set(recordRef, { ...record, userId: user.uid });
        });
        
        await batch.commit();

    } catch (error) {
        console.error("Failed to save attendance to Firestore", error);
    }
  }, [user]);

  return { attendanceRecords, addAttendanceRecords, loading };
}
