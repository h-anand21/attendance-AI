
'use client';

import { useState, useEffect } from 'react';
import type {
  Class,
  Student,
  AttendanceRecord,
  AttendanceStatus,
} from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Download, QrCode, ScanFace, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTable } from './attendance-table';
import { FaceScanModal } from './face-scan-modal';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';

type AttendanceClientProps = {
  currentClass: Class;
};

export function AttendanceClient({
  currentClass,
}: AttendanceClientProps) {
  const { toast } = useToast();
  const { studentsByClass, loading } = useStudents();
  const { addAttendanceRecords } = useAttendance();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Omit<AttendanceRecord, 'date' | 'classId'>[]>([]);
  const [isFaceScanOpen, setFaceScanOpen] = useState(false);
  
  useEffect(() => {
    const classStudents = studentsByClass[currentClass.id] || [];
    setStudents(classStudents);
    // Initialize attendance for all students as 'absent'
    setAttendance(
      classStudents.map((student) => ({
        studentId: student.id,
        status: 'absent',
      }))
    );
  }, [studentsByClass, currentClass.id]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleFaceScanComplete = (recognizedStudentIds: string[]) => {
    setAttendance((prev) =>
      prev.map((record) =>
        recognizedStudentIds.includes(record.studentId)
          ? { ...record, status: 'present' }
          : record
      )
    );
    toast({
      title: 'Face Scan Complete',
      description: `${recognizedStudentIds.length} students marked as present.`,
    });
  };

  const handleConfirmAttendance = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const recordsToSave: AttendanceRecord[] = attendance.map(record => ({
      ...record,
      date: today,
      classId: currentClass.id,
    }));
    
    addAttendanceRecords(recordsToSave);

    toast({
      title: 'Attendance Confirmed!',
      description: `Attendance for ${currentClass.name} on ${today} has been saved.`,
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your CSV export will be downloaded shortly.',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Take Attendance</CardTitle>
          <CardDescription>
            Use one of the methods below for {currentClass.name}. Today's date is {new Date().toLocaleDateString()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={() => setFaceScanOpen(true)}
            disabled={loading || students.length === 0}
          >
            <ScanFace className="mr-2 h-4 w-4" /> Start Face Scan
          </Button>
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" /> Scan RFID/QR
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <AttendanceTable
        students={students}
        attendance={attendance}
        onStatusChange={handleStatusChange}
        loading={loading}
      />

      <div className="flex justify-end">
        <Button size="lg" onClick={handleConfirmAttendance} disabled={students.length === 0}>
          <CheckCircle className="mr-2 h-5 w-5" />
          Confirm Attendance
        </Button>
      </div>

      <FaceScanModal
        isOpen={isFaceScanOpen}
        onOpenChange={setFaceScanOpen}
        students={students}
        onScanComplete={handleFaceScanComplete}
      />
    </div>
  );
}
