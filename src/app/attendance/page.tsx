
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
import { cn } from '@/lib/utils';

const classColorAccents = [
  'border-t-primary',
  'border-t-green-500',
  'border-t-yellow-500',
  'border-t-sky-500',
  'border-t-orange-500',
  'border-t-fuchsia-500'
]

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
            {classes.map((cls, index) => (
              <Link href={`/attendance/${cls.id}`} key={cls.id}>
                <Card className={cn(
                  "hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col group border-t-4",
                   classColorAccents[index % classColorAccents.length]
                )}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{cls.name}</CardTitle>
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
