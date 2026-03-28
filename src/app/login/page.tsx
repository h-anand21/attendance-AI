
'use client';

import { useAuth } from '@/hooks/use-auth';
import { GlassButton } from '@/components/ui/glass-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn, User, School, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLogo } from '@/components/ui/app-logo';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 dark:bg-background/50 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md z-10"
      >
        <Card className="glass-card overflow-hidden border-white/20">
          <CardHeader className="text-center space-y-4">
            <motion.div variants={itemVariants} className="mx-auto">
              <AppLogo className="mx-auto h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold tracking-tight">
                AttendEase
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-base text-muted-foreground/80">
                The Smart Attendance System. Select your role to continue.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-all duration-300 border backdrop-blur-sm",
                  selectedRole === 'teacher' 
                    ? "bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/10" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                )}
                onClick={() => handleRoleSelect('teacher')}
              >
                <User className="h-10 w-10" />
                <span className="font-semibold">Teacher</span>
              </button>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-all duration-300 border backdrop-blur-sm",
                  selectedRole === 'admin' 
                    ? "bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/10" 
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                )}
                onClick={() => handleRoleSelect('admin')}
              >
                <School className="h-10 w-10" />
                <span className="font-semibold">Admin</span>
              </button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <GlassButton
                variant="primary"
                className="w-full text-lg py-7 rounded-2xl"
                onClick={handleSignIn}
                disabled={loading || !selectedRole}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-6 w-6"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.7 69.7C321.3 100.2 286.7 80 248 80c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c58.5 0 109.2-31.5 133.8-78.2h-133.8v-92.7H488v.5z"
                    ></path>
                  </svg>
                )}
                Sign in with Google
              </GlassButton>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
