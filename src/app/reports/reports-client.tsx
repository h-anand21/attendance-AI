'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { BrainCircuit, FileText, Loader2 } from 'lucide-react';
import { generateAttendanceSummary } from '@/ai/flows/generate-attendance-summary';
import { analyzeAttendanceAnomalies } from '@/ai/flows/analyze-attendance-anomalies';
import { useToast } from '@/hooks/use-toast';

export function ReportsClient() {
  const { classes } = useClasses();
  const { studentsByClass } = useStudents();
  const { attendanceRecords } = useAttendance();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );

  const [aiSummary, setAiSummary] = useState('');
  const [aiAnomalies, setAiAnomalies] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isAnomaliesLoading, setIsAnomaliesLoading] = useState(false);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const { years, months } = useMemo(() => {
    const years = [
      ...new Set(
        attendanceRecords.map((r) => new Date(r.date).getFullYear().toString())
      ),
    ];
    const months = [
      ...new Set(
        attendanceRecords
          .filter(
            (r) =>
              new Date(r.date).getFullYear().toString() === selectedYear
          )
          .map((r) => (new Date(r.date).getMonth() + 1).toString())
      ),
    ].sort((a, b) => parseInt(a) - parseInt(b));
    return {
      years: years.length > 0 ? years : [new Date().getFullYear().toString()],
      months,
    };
  }, [attendanceRecords, selectedYear]);

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(
      (r) =>
        r.classId === selectedClassId &&
        new Date(r.date).getFullYear().toString() === selectedYear &&
        (new Date(r.date).getMonth() + 1).toString() === selectedMonth
    );
  }, [attendanceRecords, selectedClassId, selectedYear, selectedMonth]);

  const studentsInClass = studentsByClass[selectedClassId] || [];

  const getStudentName = (studentId: string) => {
    const student = studentsInClass.find((s) => s.id === studentId);
    return student?.name || 'Unknown Student';
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      default: return 'outline';
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedClassId) return;
    setIsSummaryLoading(true);
    setAiSummary('');
    try {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toISOString();
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString();
      
      const result = await generateAttendanceSummary({
        classId: selectedClassId,
        startDate,
        endDate,
      });
      setAiSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleAnalyzeAnomalies = async () => {
    if (!selectedClassId || filteredRecords.length === 0) return;
    setIsAnomaliesLoading(true);
    setAiAnomalies(null);
    try {
      const result = await analyzeAttendanceAnomalies({
        attendanceData: JSON.stringify(filteredRecords),
        classSection: classes.find(c => c.id === selectedClassId)?.name || 'Unknown'
      });
      setAiAnomalies(result);
    } catch (error) {
      console.error(error);
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to analyze anomalies.' });
    } finally {
      setIsAnomaliesLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>
            Select a class, year, and month to view attendance records.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
            disabled={classes.length === 0}
          >
            <SelectTrigger className="md:w-1/3">
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
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {new Date(0, parseInt(m) - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>AI-Powered Summary</CardTitle>
                        <CardDescription>Generate an overview of attendance trends.</CardDescription>
                    </div>
                    <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || !selectedClassId}>
                        {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileText className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isSummaryLoading && <p className="text-muted-foreground">Generating summary...</p>}
                {aiSummary && <p className="text-sm">{aiSummary}</p>}
                {!isSummaryLoading && !aiSummary && <p className="text-sm text-muted-foreground">Click "Generate" to get an AI summary.</p>}
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>AI Anomaly Detection</CardTitle>
                        <CardDescription>Identify unusual attendance patterns.</CardDescription>
                    </div>
                    <Button onClick={handleAnalyzeAnomalies} disabled={isAnomaliesLoading || filteredRecords.length === 0}>
                        {isAnomaliesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        Analyze
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isAnomaliesLoading && <p className="text-muted-foreground">Analyzing data...</p>}
                {aiAnomalies ? (
                    <div className='space-y-4'>
                        <p className="text-sm font-medium">{aiAnomalies.summary}</p>
                        {aiAnomalies.anomalies.length > 0 ? (
                            <ul className='space-y-2 list-disc pl-5'>
                                {aiAnomalies.anomalies.map((anomaly: any, index: number) => (
                                    <li key={index} className="text-sm">
                                        <strong>{getStudentName(anomaly.studentId)} ({anomaly.anomalyType}):</strong> {anomaly.description} on {new Date(anomaly.date).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                           <p className="text-sm text-muted-foreground">No significant anomalies detected.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Click "Analyze" to detect attendance anomalies.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} records for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No records found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <TableRow key={`${record.studentId}-${record.date}-${index}`}>
                      <TableCell className="font-medium">
                        {getStudentName(record.studentId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.studentId}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
