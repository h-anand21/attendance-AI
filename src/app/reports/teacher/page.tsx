
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const sampleTeachers = [
  {
    id: 'teacher-1',
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@school.edu',
    avatar: 'https://picsum.photos/seed/evelyn/40/40',
    classesTaught: 3,
    totalStudents: 83,
    avgAttendance: '92%',
    lastActive: '2023-10-26',
  },
  {
    id: 'teacher-2',
    name: 'Mr. Samuel Carter',
    email: 's.carter@school.edu',
    avatar: 'https://picsum.photos/seed/samuel/40/40',
    classesTaught: 2,
    totalStudents: 53,
    avgAttendance: '95%',
    lastActive: '2023-10-27',
  },
   {
    id: 'teacher-3',
    name: 'Ms. Olivia Chen',
    email: 'o.chen@school.edu',
    avatar: 'https://picsum.photos/seed/olivia/40/40',
    classesTaught: 4,
    totalStudents: 110,
    avgAttendance: '88%',
    lastActive: '2023-10-27',
  },
];

export default function TeacherReportsPage() {
  const { userRole } = useAuth();

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
    <AppLayout pageTitle="Teacher Reports">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>
                An overview of all registered teachers and their activity.
              </CardDescription>
            </div>
            <Button>
                <FileDown className='mr-2 h-4 w-4' />
                Export All Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Classes Taught</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Avg. Attendance</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTeachers.map((teacher) => (
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
                          <p className="text-sm text-muted-foreground">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teacher.classesTaught}</TableCell>
                    <TableCell>{teacher.totalStudents}</TableCell>
                    <TableCell>
                      <Badge variant={parseFloat(teacher.avgAttendance) > 90 ? 'default' : 'secondary'}>{teacher.avgAttendance}</Badge>
                    </TableCell>
                     <TableCell>
                        {new Date(teacher.lastActive).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
