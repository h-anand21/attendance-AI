
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
import { Download, QrCode, ScanFace, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTable } from './attendance-table';
import { FaceScanModal } from './face-scan-modal';
import { QrScanModal } from './qr-scan-modal';
import { useStudents } from '@/hooks/use-students';
import { useAttendance } from '@/hooks/use-attendance';
import { PhotoUploadModal } from './photo-upload-modal';
import * as XLSX from 'xlsx';


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
  
  useEffect(() => {
    const classStudents = studentsByClass[currentClass.id] || [];
    setStudents(classStudents);
    // Initialize attendance for all students as 'present'
    setAttendance(
      classStudents.map((student) => ({
        studentId: student.id,
        status: 'present',
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
    setIsExporting(true);
    try {
        const recordsToExport = attendanceRecords.filter(record => record.classId === currentClass.id);

        if (recordsToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Data to Export',
                description: 'There are no attendance records for this class to export.',
            });
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
        XLSX.writeFile(workbook, 'attendance.xlsx');
        
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
