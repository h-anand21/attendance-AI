
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClasses } from '@/hooks/use-classes';
import dynamic from 'next/dynamic';

const ReportsClient = dynamic(() => import('./reports-client').then(mod => mod.ReportsClient), {
  ssr: false,
  loading: () => (<div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>)
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
    );
  }

  const router = useRouter();

  useEffect(() => {
    if (!loading && userRole === 'teacher') {
      router.replace('/reports/teacher');
    }
  }, [userRole, loading, router]);

  if (userRole === 'teacher') {
    return (
      <AppLayout pageTitle="Attendance Reports">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
          <span className="ml-3 text-slate-300">Redirecting to Teacher Reports...</span>
        </div>
      </AppLayout>
    );
  }

  if (userRole !== 'admin') {
    return (
      <AppLayout pageTitle="Attendance Reports">
        <ReportsClient />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Attendance Reports">
      <ReportsClient />
    </AppLayout>
  );
}
