
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
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
import { AttendanceBarChart } from './attendance-bar-chart';
import { AnomalyChart } from './anomaly-chart';
import type { AttendanceStatus } from '@/types';
import { CalendarIcon, AlertTriangle, Loader2, Download } from 'lucide-react';
import { format, subDays, addDays, eachDayOfInterval } from 'date-fns';
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
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
    if (!dateRange?.from || !dateRange?.to) return [];

    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    const toDate = format(addDays(dateRange.to, 1), 'yyyy-MM-dd'); // include the 'to' date

    return attendanceRecords.filter(
      (r) =>
        r.classId === selectedClassId &&
        r.date >= fromDate &&
        r.date < toDate
    );
  }, [attendanceRecords, selectedClassId, dateRange]);

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
        description: 'There are no records for the selected class and date range.',
      });
      return;
    }
    setIsExporting(true);

    try {
        const studentsInClass = studentsByClass[selectedClassId] || [];
        const studentMap = new Map(studentsInClass.map(s => [s.id, s.name]));

        // Sheet 1: Student Summary
        const studentSummary: any[] = [];
        if (dateRange?.from && dateRange?.to) {
            const dateInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
            const classDays = new Set(filteredRecords.map(r => r.date));
            const totalClasses = classDays.size;
    
            studentsInClass.forEach(student => {
                const studentRecords = filteredRecords.filter(r => r.studentId === student.id);
                const presentCount = studentRecords.filter(r => r.status === 'present').length;
                const absentCount = totalClasses - presentCount; // Simplified logic
                studentSummary.push({
                    'Student Name': student.name,
                    'Student ID': student.id,
                    'Total Classes in Range': totalClasses,
                    'Classes Attended': presentCount,
                    'Classes Absent': absentCount,
                    'Attendance %': totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) + '%' : 'N/A'
                });
            });
        }
        const studentSheet = XLSX.utils.json_to_sheet(studentSummary);

        // Sheet 2: Daily Log
        const dailyLog: any[] = [];
        const classDays = new Set(filteredRecords.map(r => r.date));
        classDays.forEach(date => {
            const recordsForDay = filteredRecords.filter(r => r.date === date);
            const presentCount = recordsForDay.filter(r => r.status === 'present').length;
            const absentCount = recordsForDay.filter(r => r.status === 'absent').length;
            const lateCount = recordsForDay.filter(r => r.status === 'late').length;
            dailyLog.push({
                'Date': date,
                'Present': presentCount,
                'Absent': absentCount,
                'Late': lateCount,
                'Total Students': presentCount + absentCount + lateCount
            });
        });
        const dailySheet = XLSX.utils.json_to_sheet(dailyLog);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Summary');
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Log');

        const currentClass = classes.find(c => c.id === selectedClassId);
        const fileName = `Attendance_Report_${currentClass?.name.replace(/\s/g, '_')}_${format(dateRange?.from || new Date(), 'yyyyMMdd')}_to_${format(dateRange?.to || new Date(), 'yyyyMMdd')}.xlsx`;
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

  const pieChartData = useMemo(() => {
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

  const barChartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const dailyData: { [date: string]: { present: number; absent: number; late: number } } = {};
    const currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dailyData[dateStr] = { present: 0, absent: 0, late: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    filteredRecords.forEach(record => {
      if (dailyData[record.date]) {
        dailyData[record.date][record.status]++;
      }
    });

    return Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }));
  }, [filteredRecords, dateRange]);


  const studentsInClass = studentsByClass[selectedClassId] || [];

  const getStudentName = (studentId: string) => {
    const student = studentsInClass.find((s) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };
  
  const anomalyChartData = useMemo(() => {
    if (anomalies.length === 0) return [];
    
    const anomalyCounts = anomalies.reduce((acc, anomaly) => {
        const studentName = getStudentName(anomaly.studentId);
        acc[studentName] = (acc[studentName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(anomalyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count);
  }, [anomalies, studentsInClass]);
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>
            Select a class and a date range to view the attendance report.
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
                id="date"
                variant={'outline'}
                className={cn(
                  "flex-1 min-w-[200px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
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
                  <CardTitle>AI-Powered Anomaly Detection</CardTitle>
                  <CardDescription>The following insights and potential issues were detected in the selected period.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold mb-2">Anomaly Details</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {anomalies.map((anomaly, index) => (
                      <Alert key={index} className="mb-2">
                         <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{anomaly.anomalyType} - {getStudentName(anomaly.studentId)}</AlertTitle>
                          <AlertDescription>
                              {anomaly.description} (On: {new Date(anomaly.date).toLocaleDateString()})
                          </AlertDescription>
                      </Alert>
                    ))}
                    </div>
                </div>
                <div>
                   <h4 className="font-semibold mb-2">Students with Most Anomalies</h4>
                   <AnomalyChart data={anomalyChartData} />
                </div>
              </CardContent>
          </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
            <AttendancePieChart data={pieChartData} />
        </div>
        <div className="md:col-span-2">
            <AttendanceBarChart data={barChartData} />
        </div>
      </div>
    </div>
  );
}
