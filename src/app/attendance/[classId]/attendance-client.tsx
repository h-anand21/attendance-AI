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

type AttendanceClientProps = {
  currentClass: Class;
  students: Student[];
};

export function AttendanceClient({
  currentClass,
  students,
}: AttendanceClientProps) {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isFaceScanOpen, setFaceScanOpen] = useState(false);

  useEffect(() => {
    // Initialize attendance for all students as 'absent'
    setAttendance(
      students.map((student) => ({
        studentId: student.id,
        status: 'absent',
      }))
    );
  }, [students]);

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
    // Here you would typically save the data to a local DB (IndexedDB) and sync with server
    console.log('Confirmed Attendance:', attendance);
    toast({
      title: 'Attendance Confirmed!',
      description: `Attendance for ${currentClass.name} has been saved.`,
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
            Use one of the methods below for {currentClass.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setFaceScanOpen(true)}
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
      />

      <div className="flex justify-end">
        <Button size="lg" onClick={handleConfirmAttendance}>
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
