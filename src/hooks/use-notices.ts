
'use client';

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
import { db } from '@/lib/firebase';
import type { Notice } from '@/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setNotices([]);
      setLoading(false);
      return;
    }

    // Since notices are global, we'll store them at a top-level collection,
    // but for this app's architecture, we'll keep them under the user's data for simplicity.
    // In a real multi-user app, this would be a root collection.
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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch notices.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const addNotice = useCallback(
    async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'userId'>) => {
      if (!user) return;
      try {
        const noticesCollection = collection(
          db,
          'users',
          user.uid,
          'notices'
        );
        const newNotice = {
          ...noticeData,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        };
        await addDoc(noticesCollection, newNotice);
        toast({
          title: 'Notice Published',
          description: 'The new notice is now visible on the dashboard.',
        });
      } catch (error) {
        console.error('Error adding notice: ', error);
        toast({
          variant: 'destructive',
          title: 'Publishing Failed',
          description: 'Could not publish the notice. Please try again.',
        });
      }
    },
    [user, toast]
  );

  const deleteNotice = useCallback(
    async (noticeId: string) => {
      if (!user) return;
      try {
        const noticeDocRef = doc(db, 'users', user.uid, 'notices', noticeId);
        await deleteDoc(noticeDocRef);
        toast({
          title: 'Notice Deleted',
          description: 'The notice has been removed from the dashboard.',
        });
      } catch (error) {
        console.error('Error deleting notice: ', error);
        toast({
          variant: 'destructive',
          title: 'Deletion Failed',
          description: 'Could not delete the notice. Please try again.',
        });
      }
    },
    [user, toast]
  );

  return { notices, addNotice, deleteNotice, loading };
}
