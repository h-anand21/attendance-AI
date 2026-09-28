import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Notice } from '../types';
import { useAuth } from './useAuth';

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotices([]);
      setLoading(false);
      return;
    }

    const noticesCollectionRef = collection(db, 'users', user.uid, 'notices');
    const q = query(noticesCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotices = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Notice
        );
        setNotices(fetchedNotices);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notices: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNotice = useCallback(
    async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'userId'>) => {
      if (!user) return;
      try {
        const noticesCollection = collection(db, 'users', user.uid, 'notices');
        const newNotice = {
          ...noticeData,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        };
        await addDoc(noticesCollection, newNotice);
      } catch (error) {
        console.error('Error adding notice: ', error);
      }
    },
    [user]
  );

  const deleteNotice = useCallback(
    async (noticeId: string) => {
      if (!user) return;
      try {
        const noticeDocRef = doc(db, 'users', user.uid, 'notices', noticeId);
        await deleteDoc(noticeDocRef);
      } catch (error) {
        console.error('Error deleting notice: ', error);
      }
    },
    [user]
  );

  return { notices, addNotice, deleteNotice, loading };
}
