'use client';

import { AppLayout } from '@/components/app-layout';
import { notFound, useParams } from 'next/navigation';
import { AttendanceClient } from './attendance-client';
import { useClasses } from '@/hooks/use-classes';
import { Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const params = useParams();
  const classId = params.classId as string;
  const { classes, loading: classesLoading } = useClasses();

  const currentClass = classes.find((c) => c.id === classId);

  if (classesLoading) {
    return (
       <AppLayout pageTitle="Loading Attendance...">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!currentClass) {
    notFound();
  }

  return (
    <AppLayout pageTitle={`Attendance: ${currentClass.name}`}>
      <AttendanceClient currentClass={currentClass} />
    </AppLayout>
  );
}
