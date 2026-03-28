'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Student, AttendanceRecord, AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

type AttendanceTableProps = {
  students: Student[];
  attendance: Omit<AttendanceRecord, 'date' | 'classId'>[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  loading: boolean;
};

export function AttendanceTable({
  students,
  attendance,
  onStatusChange,
  loading,
}: AttendanceTableProps) {
  const getStatusForStudent = (studentId: string): AttendanceStatus => {
    return attendance.find((r) => r.studentId === studentId)?.status ?? 'absent';
  };

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Student List</GlassCardTitle>
        <GlassCardDescription>
          Review and manually adjust attendance status for each student.
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead className="w-[150px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-32 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No students registered for this class yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const status = getStatusForStudent(student.id);
                  return (
                    <TableRow key={student.id} className="hover:bg-white/5">
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={student.avatar}
                            alt={student.name}
                            data-ai-hint="person portrait"
                          />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs uppercase">
                        {student.id}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={status}
                          onValueChange={(value) =>
                            onStatusChange(student.id, value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'w-32 ml-auto rounded-xl border-white/10 bg-white/5',
                              status === 'present' &&
                                'border-primary/50 text-primary bg-primary/5',
                              status === 'absent' &&
                                'border-destructive/50 text-destructive bg-destructive/5',
                              status === 'late' && 'border-secondary/50 bg-secondary/5'
                            )}
                          >
                            <SelectValue>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="glass">
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}