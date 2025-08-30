export type Class = {
  id: string;
  name: string;
  section: string;
  studentCount: number;
};

export type Student = {
  id: string;
  name: string;
  avatar: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
};
