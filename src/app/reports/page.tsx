import { AppLayout } from '@/components/app-layout';
import { ReportsClient } from './reports-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function ReportsPageContent() {
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
