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
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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

// Google OAuth config - loaded from .env (never hardcode!)
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

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

      // Use expo-auth-session for Google sign in
      const redirectUri = AuthSession.makeRedirectUri();
      
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
      });

      const result = await request.promptAsync(discovery);
      
      if (result.type === 'success' && result.params?.id_token) {
        const credential = GoogleAuthProvider.credential(result.params.id_token);
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignout(auth);
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
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
