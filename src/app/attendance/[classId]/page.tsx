import { classes, students } from '@/lib/data';
import { AppLayout } from '@/components/app-layout';
import { notFound } from 'next/navigation';
import { AttendanceClient } from './attendance-client';

type AttendancePageProps = {
  params: {
    classId: string;
  };
};

export default function AttendancePage({ params }: AttendancePageProps) {
  const { classId } = params;
  const currentClass = classes.find((c) => c.id === classId);
  const classStudents = students[classId];

  if (!currentClass || !classStudents) {
    notFound();
  }

  return (
    <AppLayout pageTitle={`Attendance: ${currentClass.name}`}>
      <AttendanceClient currentClass={currentClass} students={classStudents} />
    </AppLayout>
  );
}
