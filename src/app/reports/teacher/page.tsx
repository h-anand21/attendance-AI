
'use client';

import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { useTeachers } from '@/hooks/use-teachers';
import { useClasses } from '@/hooks/use-classes';
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
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function TeacherReportsPage() {
  const { userRole } = useAuth();
  const { teachers, loading: teachersLoading } = useTeachers();
  const { classes, loading: classesLoading } = useClasses();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const loading = teachersLoading || classesLoading;

  const getClassLabel = (classId: string) => {
    const classInfo = classes.find(c => c.id === classId);
    return classInfo ? `${classInfo.name} - Sec. ${classInfo.section}` : classId;
  }

  const handleExport = () => {
    if (teachers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data to Export',
        description: 'There are no registered teachers to export.',
      });
      return;
    }
    setIsExporting(true);
    try {
      const dataForSheet = teachers.map(teacher => ({
        'Teacher ID': teacher.id,
        'Name': teacher.name,
        'Email': teacher.email,
        'Contact': teacher.contact,
        'Assigned Classes': teacher.classIds.map(getClassLabel).join(', '),
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');
      XLSX.writeFile(workbook, `teachers_report.xlsx`);
      
      toast({
          title: 'Export Successful',
          description: 'The teacher report has been downloaded.',
      });
    } catch (error) {
      console.error("Error exporting teachers to Excel:", error);
      toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'An error occurred while exporting the data.',
      });
    } finally {
      setIsExporting(false);
    }
  };


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
            <Button onClick={handleExport} disabled={isExporting || loading || teachers.length === 0}>
                {isExporting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileDown className='mr-2 h-4 w-4' />}
                Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email & Contact</TableHead>
                  <TableHead>Assigned Classes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-sm text-muted-foreground">{teacher.contact}</p>
                      </TableCell>
                       <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(teacher.classIds || []).map(classId => (
                            <Badge key={classId} variant="outline">{getClassLabel(classId)}</Badge>
                          ))}
                        </div>
                       </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
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
