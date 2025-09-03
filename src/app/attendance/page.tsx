
'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AllClassesPage() {
  const { classes, loading: classesLoading } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();

  const loading = classesLoading || studentsLoading;

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Classes...">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="All Classes">
        {classes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => (
              <Link href={`/attendance/${cls.id}`} key={cls.id}>
                <Card className="hover:border-primary/80 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant="secondary">Section {cls.section}</Badge>
                    </div>
                    <CardDescription>Click to start attendance</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{(studentsByClass[cls.id] || []).length} Students</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
           <Card>
             <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                    <p>No classes found.</p>
                </div>
             </CardContent>
           </Card>
        )}
    </AppLayout>
  );
}
