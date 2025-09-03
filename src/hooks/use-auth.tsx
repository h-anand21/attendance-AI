
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

let isSigningIn = false;
const ROLE_STORAGE_KEY = 'attendease_user_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
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
           // Default to teacher if no role is stored
           setUserRole('teacher');
           localStorage.setItem(ROLE_STORAGE_KEY, 'teacher');
        }
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem(ROLE_STORAGE_KEY);
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
    if (isSigningIn) {
      return;
    }
    isSigningIn = true;

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
      })
      .then(() => {
         const role = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
         if (role === 'admin') {
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
          isSigningIn = false;
      });
  }, [toast, router]);


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
