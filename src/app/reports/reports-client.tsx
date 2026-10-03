'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
} from '@/components/ui/glass-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassButton } from '@/components/ui/glass-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';
import { AttendancePieChart } from './attendance-pie-chart';
import { AttendanceBarChart } from './attendance-bar-chart';
import { AnomalyChart } from './anomaly-chart';
import type { AttendanceStatus } from '@/types';
import { CalendarIcon, AlertTriangle, Loader2, Download } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { analyzeAttendanceAnomalies } from '@/ai/flows/analyze-attendance-anomalies';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function ReportsClient() {
  const { classes } = useClasses();
  const { studentsByClass } = useStudents();
  const { attendanceRecords } = useAttendance();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const classIdFromParams = searchParams.get('classId');
    if (classIdFromParams && classes.some(c => c.id === classIdFromParams)) {
      return classIdFromParams;
    }
    return classes.length > 0 ? classes[0].id : '';
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const filteredRecords = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to || !selectedClassId) return [];

    const fromDateStr = format(dateRange.from, 'yyyy-MM-dd');
    const toDateStr = format(dateRange.to, 'yyyy-MM-dd');

    return attendanceRecords.filter(
      (r) =>
        r.classId === selectedClassId &&
        r.date >= fromDateStr &&
        r.date <= toDateStr
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
        toast({
            variant: 'destructive',
            title: 'AI Analysis Failed',
            description: 'Could not analyze data.',
        });
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (filteredRecords.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data to Export',
        description: 'Records not found for the selected filter.',
      });
      return;
    }
    setIsExporting(true);

    try {
        const XLSX = await import('xlsx');
        const studentsInClass = studentsByClass[selectedClassId] || [];
        const studentSummary: any[] = [];
        if (dateRange?.from && dateRange?.to) {
            const classDays = new Set(filteredRecords.map(r => r.date));
            const totalClasses = classDays.size;
    
            studentsInClass.forEach(student => {
                const studentRecords = filteredRecords.filter(r => r.studentId === student.id);
                const presentCount = studentRecords.filter(r => r.status === 'present').length;
                const absentCount = totalClasses - presentCount;
                studentSummary.push({
                    'Student Name': student.name,
                    'Student ID': student.id,
                    'Total Classes': totalClasses,
                    'Attended': presentCount,
                    'Absent': absentCount,
                    'Attendance %': totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) + '%' : 'N/A'
                });
            });
        }
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(studentSummary), 'Summary');
        const currentClass = classes.find(c => c.id === selectedClassId);
        XLSX.writeFile(workbook, `Report_${currentClass?.name.replace(/\s/g, '_')}.xlsx`);

         toast({
            title: 'Export Successful',
            description: 'Report downloaded.',
        });

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Export Failed',
            description: 'Error generating file.',
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
    return Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [filteredRecords]);

  const barChartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    const dailyData: { [date: string]: { present: number; absent: number; late: number } } = {};
    eachDayOfInterval({ start: dateRange.from, end: dateRange.to }).forEach(day => {
        dailyData[format(day, 'yyyy-MM-dd')] = { present: 0, absent: 0, late: 0 };
    });
    filteredRecords.forEach(record => {
      if (dailyData[record.date]) dailyData[record.date][record.status]++;
    });
    return Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }));
  }, [filteredRecords, dateRange]);

  const getStudentName = (studentId: string) => {
    return (studentsByClass[selectedClassId] || []).find(s => s.id === studentId)?.name || 'Unknown';
  };
  
  const anomalyChartData = useMemo(() => {
    if (anomalies.length === 0) return [];
    const counts = anomalies.reduce((acc, a) => {
        const name = getStudentName(a.studentId);
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((a, b) => b.count - a.count);
  }, [anomalies, selectedClassId]);

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Filter Reports</GlassCardTitle>
          <GlassCardDescription>Select class and date range for analysis.</GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="flex flex-wrap items-center gap-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={classes.length === 0}>
            <SelectTrigger className="flex-1 min-w-[200px] glass h-12 rounded-xl border-slate-200/80 dark:border-white/10">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent className="glass">
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} (Sec. {c.section})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <GlassButton variant="outline" className="flex-1 min-w-[250px] justify-start text-left h-12">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : "Pick range"}
              </GlassButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass" align="start">
              <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>
           <GlassButton variant="primary" onClick={handleAnalyzeAnomalies} disabled={isAnalyzing || filteredRecords.length === 0}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Analyze AI
            </GlassButton>
            <GlassButton variant="outline" onClick={handleExport} disabled={isExporting || filteredRecords.length === 0}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export
            </GlassButton>
        </GlassCardContent>
      </GlassCard>

      {anomalies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard>
                <GlassCardHeader>
                    <GlassCardTitle>AI Insights</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {anomalies.map((a, i) => (
                      <Alert key={i} className="glass border-white/10 text-xs">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <AlertTitle className="font-bold">{getStudentName(a.studentId)}</AlertTitle>
                          <AlertDescription>{a.description}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                  <div>
                     <AnomalyChart data={anomalyChartData} />
                  </div>
                </GlassCardContent>
            </GlassCard>
          </motion.div>
      )}
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <AttendancePieChart data={pieChartData} title="Summary" description="Status distribution" />
        </div>
        <div className="md:col-span-2">
            <AttendanceBarChart data={barChartData} />
        </div>
      </div>
    </div>
  );
}