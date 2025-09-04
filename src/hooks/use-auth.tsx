
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignout,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'teacher' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  setUserRoleForSignIn: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'attendease_user_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
        if (storedRole) {
           setUserRole(storedRole);
        } else {
           // This case should ideally not happen if role is set before sign-in
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

  const setUserRoleForSignIn = useCallback((role: UserRole) => {
    if (role) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
  }, []);

  const signInWithGoogle = useCallback(() => {
    const roleForSignIn = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
    if (!roleForSignIn) {
      toast({
        variant: 'destructive',
        title: 'Role not selected',
        description: 'Please select a role before signing in.',
      });
      return;
    }

    if (isSigningIn) {
      return;
    }
    setIsSigningIn(true);
    setLoading(true);

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
      })
      .then((result) => {
         // After successful sign-in, result.user is available
         // The onAuthStateChanged listener will handle setting user state
         // We can now redirect based on the role stored before sign-in
         if (roleForSignIn === 'admin') {
            router.push('/registration');
         } else {
            router.push('/dashboard');
         }
      })
      .catch((error) => {
        console.error('Error signing in with Google:', error);
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          toast({
            title: 'Sign-in Cancelled',
            description:
              'The sign-in process was not completed.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Sign-in Failed',
            description: 'Could not sign in with Google. Please try again.',
          });
        }
      })
      .finally(() => {
          setIsSigningIn(false);
          setLoading(false);
      });
  }, [toast, router, isSigningIn]);


  const signOut = async () => {
    try {
      await firebaseSignout(auth);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-out Failed',
        description: 'Could not sign out. Please try again.',
      });
    }
  };

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
