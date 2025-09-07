
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useTeachers } from '@/hooks/use-teachers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';

export default function TeacherReportsPage() {
  const { userRole } = useAuth();
  const { teachers, loading } = useTeachers();

  if (userRole !== 'admin') {
    return (
      <AppLayout pageTitle="Access Denied">
        <Card>
          <CardHeader>
            <CardTitle>Permission Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You do not have permission to view this page. Please contact an
              administrator.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Teacher Activity">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>
                An overview of all registered teachers in the system.
              </CardDescription>
            </div>
            <Button disabled>
                <FileDown className='mr-2 h-4 w-4' />
                Export Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={teacher.avatar} alt={teacher.name} data-ai-hint="person portrait"/>
                            <AvatarFallback>
                              {teacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{teacher.email}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                       No teachers registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
