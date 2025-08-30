
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
import { Users, BookOpen, Loader2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { classes, loading: classesLoading } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();

  const totalStudents = useMemo(() => {
    return Object.values(studentsByClass).reduce(
      (acc, classStudents) => acc + classStudents.length,
      0
    );
  }, [studentsByClass]);

  const loading = classesLoading || studentsLoading;

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Classes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all sections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in your classes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Select a Class
          </h2>
          <Button asChild>
            <Link href="/registration">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Class
            </Link>
          </Button>
        </div>
        {classes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {classes.map((cls) => (
              <Link href={`/attendance/${cls.id}`} key={cls.id}>
                <Card className="hover:border-primary/80 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col hover:shadow-primary/20">
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
                    <Button variant="link" asChild>
                        <Link href="/registration">Go to Registration to create a class</Link>
                    </Button>
                </div>
             </CardContent>
           </Card>
        )}
      </div>
    </AppLayout>
  );
}
