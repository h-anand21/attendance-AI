
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn, User, School } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLogo } from '@/components/ui/app-logo';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Role = 'teacher' | 'admin';

export default function LoginPage() {
  const { user, signInWithGoogle, loading, setUserRoleForSignIn } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSignIn = () => {
    if (selectedRole) {
      setUserRoleForSignIn(selectedRole);
      signInWithGoogle();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="w-full max-w-md shadow-2xl overflow-hidden">
          <CardHeader className="text-center space-y-4">
            <motion.div variants={itemVariants} className="mx-auto">
              <AppLogo className="mx-auto h-16 w-16 text-primary" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold">
                Welcome to AttendEase
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-base">
                The Smart Attendance System. Please select your role to continue.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <Button
                variant={selectedRole === 'teacher' ? 'default' : 'outline'}
                className="h-28 flex-col gap-2 text-lg"
                onClick={() => handleRoleSelect('teacher')}
              >
                <User className="h-10 w-10 mb-1" />
                Teacher
              </Button>
              <Button
                variant={selectedRole === 'admin' ? 'default' : 'outline'}
                className="h-28 flex-col gap-2 text-lg"
                onClick={() => handleRoleSelect('admin')}
              >
                <School className="h-10 w-10 mb-1" />
                Admin
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                className="w-full text-lg py-6"
                onClick={handleSignIn}
                disabled={loading || !selectedRole}
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-6 w-6"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.7 69.7C321.3 100.2 286.7 80 248 80c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c58.5 0 109.2-31.5 133.8-78.2h-133.8v-92.7H488v.5z"
                    ></path>
                  </svg>
                )}
                Sign in with Google
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
