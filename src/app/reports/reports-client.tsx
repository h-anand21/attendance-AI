
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
import { AttendanceChart } from './attendance-chart';
import type { AttendanceStatus } from '@/types';

export function ReportsClient() {
  const { classes } = useClasses();
  const { studentsByClass } = useStudents();
  const { attendanceRecords } = useAttendance();
  const searchParams = useSearchParams();

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );

  useEffect(() => {
    const classIdFromParams = searchParams.get('classId');
    if (classIdFromParams) {
      setSelectedClassId(classIdFromParams);
    } else if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [searchParams, classes, selectedClassId]);

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

  const chartData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    
    const dataByDate = filteredRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { present: 0, absent: 0, late: 0 };
      }
      acc[record.date][record.status]++;
      return acc;
    }, {} as Record<string, Record<AttendanceStatus, number>>);

    return Object.entries(dataByDate)
      .map(([date, counts]) => ({
        date,
        present: counts.present || 0,
        absent: counts.absent || 0,
        late: counts.late || 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredRecords]);

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
      
      {chartData.length > 0 ? (
         <AttendanceChart data={chartData} />
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No attendance data to display for this period.</p>
            </CardContent>
        </Card>
      )}

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
