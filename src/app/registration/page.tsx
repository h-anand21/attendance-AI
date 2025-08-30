import { AppLayout } from '@/components/app-layout';
import { RegistrationClient } from './registration-client';
import { classes, students } from '@/lib/data';

export default function RegistrationPage() {
  return (
    <AppLayout pageTitle="Student Registration">
      <RegistrationClient classes={classes} initialStudents={students} />
    </AppLayout>
  );
}
