
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';

export default function RegistrationPage() {
  const { userRole } = useAuth();

  // This page is now the admin dashboard
  if (userRole !== 'admin') {
    return (
      <AppLayout pageTitle="Dashboard">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page. This is the admin dashboard.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout pageTitle="Admin Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Reports</CardTitle>
             <CardDescription>View and manage teacher reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/reports/teacher">
                <Users className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>Register new students and manage records.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild className="w-full">
              <Link href="/registration/details">
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Students
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
