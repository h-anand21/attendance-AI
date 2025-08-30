'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Class } from '@/types';
import { classes as initialClassesData } from '@/lib/data';

const CLASS_STORAGE_KEY = 'attendease_classes';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedClasses = localStorage.getItem(CLASS_STORAGE_KEY);
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      } else {
        // If nothing is in local storage, use the initial mock data
        setClasses(initialClassesData);
        localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(initialClassesData));
      }
    } catch (error) {
      console.error("Failed to read classes from localStorage", error);
      setClasses(initialClassesData);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClass = useCallback(async (newClassData: Omit<Class, 'id' | 'studentCount'>) => {
    const newId = `${newClassData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
    const newClass: Class = {
        ...newClassData,
        id: newId,
        studentCount: 0, // studentCount is now dynamic
    }

    setClasses(prev => {
        const newState = [...prev, newClass];
        try {
            localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error("Failed to save class to localStorage", error);
        }
        return newState;
    });
  }, []);

  return { classes, addClass, loading };
}
