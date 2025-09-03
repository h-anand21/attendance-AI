
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AppLogo className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-bold">
            Welcome to AttendEase
          </CardTitle>
          <CardDescription>
            The Smart Attendance System. Please select your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                'h-24 flex-col gap-2 text-lg',
                selectedRole === 'teacher' && 'border-primary ring-2 ring-primary'
              )}
              onClick={() => handleRoleSelect('teacher')}
            >
              <User className="h-8 w-8" />
              Teacher
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                'h-24 flex-col gap-2 text-lg',
                selectedRole === 'admin' && 'border-primary ring-2 ring-primary'
              )}
              onClick={() => handleRoleSelect('admin')}
            >
              <School className="h-8 w-8" />
              School
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={handleSignIn}
            disabled={loading || !selectedRole}
            size="lg"
          >
            {loading ? (
              <LogIn className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
