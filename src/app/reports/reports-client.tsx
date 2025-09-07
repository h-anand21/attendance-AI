
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AttendancePieChart } from './attendance-pie-chart';
import type { AttendanceStatus } from '@/types';
import { CalendarIcon, AlertTriangle, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { analyzeAttendanceAnomalies } from '@/ai/flows/analyze-attendance-anomalies';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

export function ReportsClient() {
  const { classes } = useClasses();
  const { studentsByClass } = useStudents();
  const { attendanceRecords } = useAttendance();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const classIdFromParams = searchParams.get('classId');
    if (classIdFromParams && classes.some(c => c.id === classIdFromParams)) {
      setSelectedClassId(classIdFromParams);
    } else if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [searchParams, classes, selectedClassId]);

  const filteredRecords = useMemo(() => {
    const selectedDate = format(date, 'yyyy-MM-dd');
    return attendanceRecords.filter(
      (r) => r.classId === selectedClassId && r.date === selectedDate
    );
  }, [attendanceRecords, selectedClassId, date]);
  
  const handleAnalyzeAnomalies = async () => {
    if (!selectedClassId) return;
    setIsAnalyzing(true);
    setAnomalies([]);

    const currentClass = classes.find(c => c.id === selectedClassId);

    try {
        const result = await analyzeAttendanceAnomalies({
            attendanceData: JSON.stringify(filteredRecords),
            classSection: `${currentClass?.name} - Section ${currentClass?.section}`,
        });
        setAnomalies(result.anomalies);
    } catch(error) {
        console.error("Error analyzing anomalies:", error);
         toast({
            variant: 'destructive',
            title: 'AI Analysis Failed',
            description: 'An error occurred while analyzing anomalies.',
        });
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data to Export',
        description: 'There are no records for the selected class and day.',
      });
      return;
    }
    setIsExporting(true);

    try {
        const studentsInClass = studentsByClass[selectedClassId] || [];
        
        const dataToExport = filteredRecords.map(record => ({
            'Student Name': getStudentName(record.studentId),
            'Student ID': record.studentId,
            'Date': record.date,
            'Status': record.status,
        }));

        const summarySheet = XLSX.utils.json_to_sheet(dataToExport);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Daily Log');

        const currentClass = classes.find(c => c.id === selectedClassId);
        const fileName = `Attendance_Report_${currentClass?.name.replace(/\s/g, '_')}_${format(date, 'yyyy_MM_dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

         toast({
            title: 'Export Successful',
            description: 'The attendance report has been downloaded.',
        });

    } catch (error) {
         console.error("Error exporting to Excel:", error);
        toast({
            variant: 'destructive',
            title: 'Export Failed',
            description: 'An error occurred while exporting the data.',
        });
    } finally {
        setIsExporting(false);
    }
  }

  const chartData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    
    const statusCounts = filteredRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<AttendanceStatus, number>);

    return Object.entries(statusCounts)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
  }, [filteredRecords]);

  const studentsInClass = studentsByClass[selectedClassId] || [];

  const getStudentName = (studentId: string) => {
    const student = studentsInClass.find((s) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };
  
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>
            Select a class and a day to view the attendance report.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
            disabled={classes.length === 0}
          >
            <SelectTrigger className="flex-1 min-w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} - Section {c.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'flex-1 min-w-[200px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => setDate(day || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
           <Button onClick={handleAnalyzeAnomalies} disabled={isAnalyzing || filteredRecords.length === 0}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Analyze with AI
            </Button>
            <Button onClick={handleExport} disabled={isExporting || filteredRecords.length === 0}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Report
            </Button>
        </CardContent>
      </Card>

        {isAnalyzing && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )}
      
      {anomalies.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>AI-Detected Anomalies</CardTitle>
                  <CardDescription>The following potential anomalies were detected in the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                  {anomalies.map((anomaly, index) => (
                      <Alert key={index} className="mb-2">
                         <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{anomaly.anomalyType} - {getStudentName(anomaly.studentId)}</AlertTitle>
                          <AlertDescription>
                              {anomaly.description} (On: {new Date(anomaly.date).toLocaleDateString()})
                          </AlertDescription>
                      </Alert>
                  ))}
              </CardContent>
          </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <AttendancePieChart data={chartData} />
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Day Status</CardTitle>
                    <CardDescription>A live look at today's check-ins.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Donut chart coming soon.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Daily Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center">
                                No records found.
                                </TableCell>
                            </TableRow>
                            ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                    {getStudentName(record.studentId)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={getStatusVariant(record.status)}>
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
