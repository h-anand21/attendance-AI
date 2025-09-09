
'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { useMealVerifications } from '@/hooks/use-meal-verifications';
import { CalendarIcon, QrCode, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { VerificationTable } from './verification-table';
import { QrScanModal } from '@/app/attendance/[classId]/qr-scan-modal';
import type { Student } from '@/types';

export function MealVerificationClient() {
  const { classes } = useClasses();
  const { studentsByClass } = useStudents();
  const { attendanceRecords } = useAttendance();
  const { verifications, addMealVerification, loading: verificationsLoading } = useMealVerifications();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isQrScanOpen, setQrScanOpen] = useState(false);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const { presentStudents, verificationMap } = useMemo(() => {
    // Get all students marked as 'present' or 'late' on the selected date
    const presentRecords = attendanceRecords.filter(
      r => r.date === selectedDateStr && (r.status === 'present' || r.status === 'late')
    );
    const presentStudentIds = new Set(presentRecords.map(r => r.studentId));

    const allStudents = Object.values(studentsByClass).flat();
    const presentStudents = allStudents.filter(s => presentStudentIds.has(s.id));
    
    // Create a map of verifications for the selected date for quick lookup
    const dailyVerifications = verifications.filter(v => v.date === selectedDateStr);
    const verificationMap = new Map(
        dailyVerifications.map(v => [v.studentId, v])
    );
    
    return { presentStudents, verificationMap };
  }, [selectedDateStr, attendanceRecords, studentsByClass, verifications]);

  const handleQrScan = async (studentId: string) => {
    const student = presentStudents.find(s => s.id === studentId);
    
    if (!student) {
        toast({
            variant: 'destructive',
            title: 'Student Not Marked Present',
            description: 'This student is not on the list of present students for today. Please check their attendance record.',
        });
        return;
    }

    if (verificationMap.has(studentId)) {
        toast({
            title: 'Already Verified',
            description: `${student.name}'s meal has already been verified today.`,
        });
        return;
    }

    const success = await addMealVerification({
      studentId,
      date: selectedDateStr,
      source: 'qr',
    });

    if (success) {
      // The real-time listener will update the UI.
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meal Verification Controls</CardTitle>
          <CardDescription>
            Select a date and scan student QR codes to verify meal distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[300px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date('2024-01-01')}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => setQrScanOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Scan to Verify
          </Button>
        </CardContent>
      </Card>
      
      <VerificationTable 
        students={presentStudents}
        verificationMap={verificationMap}
        classes={classes}
        onManualVerify={addMealVerification}
        selectedDate={selectedDateStr}
        loading={verificationsLoading}
      />
      
       <QrScanModal
        isOpen={isQrScanOpen}
        onOpenChange={setQrScanOpen}
        onScan={handleQrScan}
      />
    </div>
  );
}

