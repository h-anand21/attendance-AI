
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useClasses } from '@/hooks/use-classes';
import dynamic from 'next/dynamic';

const ReportsClient = dynamic(() => import('./reports-client').then(mod => mod.ReportsClient), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
});

export default function ReportsPage() {
  const { userRole, loading: authLoading } = useAuth();
  const { loading: classesLoading } = useClasses();

  const loading = authLoading || classesLoading;

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Reports...">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (userRole !== 'admin') {
    return (
      <AppLayout pageTitle="Access Denied">
        <Card>
          <CardHeader>
            <CardTitle>Permission Required</CardTitle>
          </Header>
          <CardContent>
            <p>You do not have permission to view this page. Please contact an administrator.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Attendance Reports">
      <ReportsClient />
    </AppLayout>
  );
}
