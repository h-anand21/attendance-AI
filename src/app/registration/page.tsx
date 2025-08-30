import { AppLayout } from '@/components/app-layout';
import { RegistrationClient } from './registration-client';

export default function RegistrationPage() {
  return (
    <AppLayout pageTitle="Student Registration">
      <RegistrationClient />
    </AppLayout>
  );
}
