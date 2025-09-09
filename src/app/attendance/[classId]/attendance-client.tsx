
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { Download, QrCode, Upload, CheckCircle, Loader2, ScanFace } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTable } from './attendance-table';
import { FaceScanModal } from './face-scan-modal';
import { QrScanModal } from './qr-scan-modal';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';
import { PhotoUploadModal } from './photo-upload-modal';
import * as XLSX from 'xlsx';
import { AnimatedButton, SparkleIcon } from '@/components/ui/animated-button';


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

    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = attendanceRecords.filter(
      r => r.classId === currentClass.id && r.date === today
    );

    let initialAttendance;
    if (todaysRecords.length > 0) {
      // If records for today exist, use them
      initialAttendance = classStudents.map(student => {
        const record = todaysRecords.find(r => r.studentId === student.id);
        return {
          studentId: student.id,
          status: record ? record.status : 'absent', // Default to absent if student has no record today
        };
      });
      setIsAttendanceConfirmed(true);
    } else {
      // If no records for today, default everyone to absent
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
    // Any change should allow re-confirmation
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
    setIsAttendanceConfirmed(false); // Changes were made, allow confirmation
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
    setIsAttendanceConfirmed(true);

    toast({
      title: 'Attendance Confirmed!',
      description: `Attendance for ${currentClass.name} on ${format(new Date(), 'dd / MM / yyyy')} has been saved.`,
    });
  };

  const handleExport = () => {
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
      <Card>
        <CardHeader>
          <CardTitle>Take Attendance</CardTitle>
          <CardDescription>
            Use one of the methods below for {currentClass.name}. Today's date is {format(new Date(), 'dd / MM / yyyy')}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <AnimatedButton
            onClick={() => setFaceScanOpen(true)}
            disabled={loading || students.length === 0}
          >
            <ScanFace className="h-6 w-6" />
            Start Face Scan
          </AnimatedButton>
          <Button 
            variant="outline"
            onClick={() => setPhotoUploadOpen(true)}
            disabled={loading || students.length === 0}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
          <Button 
            variant="outline"
            onClick={() => setQrScanOpen(true)}
            disabled={loading || students.length === 0}
          >
            <QrCode className="mr-2 h-4 w-4" /> Scan RFID/QR
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download Excel
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
        <button
          onClick={handleConfirmAttendance}
          disabled={students.length === 0 || isAttendanceConfirmed}
          className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative animate-rainbow cursor-pointer border-0 bg-[linear-gradient(hsl(var(--card)),hsl(var(--card))),linear-gradient(hsl(var(--card))_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] hover:scale-105 active:scale-95 h-11 px-8 inline-flex"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {isAttendanceConfirmed ? 'Attendance Saved' : 'Confirm Attendance'}
        </button>
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
