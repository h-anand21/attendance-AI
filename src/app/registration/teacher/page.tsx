
'use client';

import { AppLayout } from '@/components/app-layout';
import { TeacherRegistrationClient } from './teacher-registration-client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherRegistrationPage() {
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
    <AppLayout pageTitle="Teacher Registration">
      <TeacherRegistrationClient />
    </AppLayout>
  );
}
