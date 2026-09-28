import React, { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignout,
  User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

// Configure Google Sign-In with Web Client ID from google-services.json
// This uses native Google Play Services popup — NO browser redirect!
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '271051407293-fppbupib6u5evms1a7oakmnq0l9kcmrd.apps.googleusercontent.com',
  offlineAccess: true,
});

export type UserRole = 'admin' | 'teacher' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUserRoleForSignIn: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'attendease_user_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const storedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        if (storedRole) {
          setUserRole(storedRole as UserRole);
        } else {
          setUserRole('teacher');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUserRoleForSignIn = useCallback(async (role: UserRole) => {
    if (role) {
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, role);
      setUserRole(role);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const roleForSignIn = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
      if (!roleForSignIn) {
        setLoading(false);
        return;
      }

      // Check if Google Play Services is available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign out from local Google session first so account chooser opens every time
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      // Native Google Sign-In — opens Google account picker popup
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      try {
        await GoogleSignin.revokeAccess();
      } catch (_) {}
      try {
        await GoogleSignin.signOut();
      } catch (_) {}
      await firebaseSignout(auth);
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const authContextValue: AuthContextType = {
    user,
    userRole,
    loading,
    signInWithGoogle,
    signOut,
    setUserRoleForSignIn,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
