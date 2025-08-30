'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AttendanceRecord } from '@/types';

const ATTENDANCE_STORAGE_KEY = 'attendease_attendance';

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (storedAttendance) {
        setAttendanceRecords(JSON.parse(storedAttendance));
      }
    } catch (error) {
      console.error("Failed to read attendance from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAttendanceRecords = useCallback((newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(prev => {
        // Filter out any records for the same student, class, and date to avoid duplicates
        const existingKeys = new Set(newRecords.map(r => `${r.studentId}-${r.classId}-${r.date}`));
        const filteredPrev = prev.filter(r => !existingKeys.has(`${r.studentId}-${r.classId}-${r.date}`));
        
        const newState = [...filteredPrev, ...newRecords];
        try {
            localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error("Failed to save attendance to localStorage", error);
        }
        return newState;
    });
  }, []);

  return { attendanceRecords, addAttendanceRecords, loading };
}
