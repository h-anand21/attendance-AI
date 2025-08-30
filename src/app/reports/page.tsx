
'use client';

import { AppLayout } from '@/components/app-layout';
import { ReportsClient } from './reports-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ReportsPageContent() {
  const { userRole } = useAuth();

  if (userRole !== 'admin') {
    return (
      <AppLayout pageTitle="Access Denied">
        <Card>
          <CardHeader>
            <CardTitle>Permission Required</CardTitle>
          </CardHeader>
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

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <AppLayout pageTitle="Loading Reports...">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </AppLayout>
        }>
            <ReportsPageContent />
        </Suspense>
    )
}
