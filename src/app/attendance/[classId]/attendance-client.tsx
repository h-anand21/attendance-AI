'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type {
  Class,
  Student,
  AttendanceRecord,
  AttendanceStatus,
} from '@/types';
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
} from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Download, QrCode, Upload, CheckCircle, Loader2, ScanFace } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTable } from './attendance-table';
import { FaceScanModal } from './face-scan-modal';
import { QrScanModal } from './qr-scan-modal';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';
import { PhotoUploadModal } from './photo-upload-modal';
import { AnimatedButton } from '@/components/ui/animated-button';

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type AttendanceClientProps = {
  currentClass: Class;
};

export function AttendanceClient({
  currentClass,
}: AttendanceClientProps) {
  const { toast } = useToast();
  const { studentsByClass, loading } = useStudents();
  const { attendanceRecords, addAttendanceRecords } = useAttendance();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Omit<AttendanceRecord, 'date' | 'classId'>[]>([]);
  const [isFaceScanOpen, setFaceScanOpen] = useState(false);
  const [isQrScanOpen, setQrScanOpen] = useState(false);
  const [isPhotoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAttendanceConfirmed, setIsAttendanceConfirmed] = useState(false);
  
  useEffect(() => {
    const classStudents = studentsByClass[currentClass.id] || [];
    setStudents(classStudents);

    const todayStr = toLocalDateString(new Date());
    const todaysRecords = attendanceRecords.filter(
      r => r.classId === currentClass.id && r.date === todayStr
    );

    let initialAttendance;
    if (todaysRecords.length > 0) {
      initialAttendance = classStudents.map(student => {
        const record = todaysRecords.find(r => r.studentId === student.id);
        return {
          studentId: student.id,
          status: record ? record.status : 'absent',
        };
      });
      setIsAttendanceConfirmed(true);
    } else {
      initialAttendance = classStudents.map(student => ({
        studentId: student.id,
        status: 'absent',
      }));
      setIsAttendanceConfirmed(false);
    }
    setAttendance(initialAttendance);
    
  }, [studentsByClass, currentClass.id, attendanceRecords]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
    setIsAttendanceConfirmed(false);
  };

  const handleQrScan = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if(student) {
        handleStatusChange(studentId, 'present');
        toast({
            title: 'Student Scanned',
            description: `${student.name} has been marked as present.`,
        });
    } else {
         toast({
            variant: 'destructive',
            title: 'Scan Failed',
            description: 'This QR code does not belong to any student in this class.',
        });
    }
  };


  const handleFaceScanComplete = (recognizedStudentIds: string[]) => {
    const updatedAttendance = attendance.map(record =>
      recognizedStudentIds.includes(record.studentId)
        ? { ...record, status: 'present' as AttendanceStatus }
        : record
    );
    setAttendance(updatedAttendance);
    setIsAttendanceConfirmed(false);
    toast({
      title: 'Face Scan Complete',
      description: `${recognizedStudentIds.length} students marked as present.`,
    });
  };

  const handleConfirmAttendance = () => {
    const recordsToSave: Omit<AttendanceRecord, 'date'>[] = attendance.map(record => ({
      ...record,
      classId: currentClass.id,
    }));
    
    addAttendanceRecords(recordsToSave as any);
    setIsAttendanceConfirmed(true);

    toast({
      title: 'Attendance Confirmed!',
      description: `Attendance for ${currentClass.name} on ${format(new Date(), 'dd / MM / yyyy')} has been saved.`,
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const recordsToExport = attendanceRecords.filter(record => record.classId === currentClass.id);

        if (recordsToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Data to Export',
                description: 'There are no attendance records for this class to export.',
            });
            setIsExporting(false);
            return;
        }

        const XLSX = await import('xlsx');
        const dataForSheet = recordsToExport.map(record => {
            const student = students.find(s => s.id === record.studentId);
            return {
                'Student Name': student ? student.name : 'Unknown Student',
                'Student ID': record.studentId,
                Date: record.date,
                Status: record.status,
            };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `attendance_${currentClass.name.replace(/\s/g, '_')}.xlsx`);
        
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
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Take Attendance</GlassCardTitle>
          <GlassCardDescription>
            Use one of the methods below for {currentClass.name}. Today's date is {format(new Date(), 'dd / MM / yyyy')}.
          </GlassCardDescription>
        </GlassCardHeader>
        <GlassCardContent className="flex flex-wrap gap-4">
          <AnimatedButton
            onClick={() => setFaceScanOpen(true)}
            disabled={loading || students.length === 0}
            className="h-12"
          >
            <ScanFace className="h-6 w-6" />
            Start Face Scan
          </AnimatedButton>
          <GlassButton 
            variant="outline"
            onClick={() => setPhotoUploadOpen(true)}
            disabled={loading || students.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Photo
          </GlassButton>
          <GlassButton 
            variant="outline"
            onClick={() => setQrScanOpen(true)}
            disabled={loading || students.length === 0}
          >
            <QrCode className="mr-2 h-4 w-4" /> Scan RFID/QR
          </GlassButton>
          <GlassButton variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download Excel
          </GlassButton>
        </GlassCardContent>
      </GlassCard>

      <AttendanceTable
        students={students}
        attendance={attendance}
        onStatusChange={handleStatusChange}
        loading={loading}
      />

      <div className="flex justify-end">
        <GlassButton
          variant="primary"
          onClick={handleConfirmAttendance}
          disabled={students.length === 0 || isAttendanceConfirmed}
          className="h-14 px-10 rounded-2xl font-bold shadow-2xl"
        >
          <CheckCircle className="mr-2 h-6 w-6" />
          {isAttendanceConfirmed ? 'Attendance Saved' : 'Confirm Attendance'}
        </GlassButton>
      </div>

      <FaceScanModal
        isOpen={isFaceScanOpen}
        onOpenChange={setFaceScanOpen}
        students={students}
        onScanComplete={handleFaceScanComplete}
      />
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onOpenChange={setPhotoUploadOpen}
        students={students}
        onScanComplete={handleFaceScanComplete}
      />
      <QrScanModal
        isOpen={isQrScanOpen}
        onOpenChange={setQrScanOpen}
        onScan={handleQrScan}
      />
    </div>
  );
}