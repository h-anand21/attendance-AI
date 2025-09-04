export type Class = {
  id: string;
  name: string;
  section: string;
  studentCount: number;
};

export type Student = {
  id: string;
  name: string;
  avatar: string; // This will be a data URL for Firestore
};

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  date: string; // ISO date string (e.g., "2023-10-27")
  classId: string;
  userId: string; // To associate record with the logged-in user
};

export type Task = {
  id: number;
  text: string;
  completed: boolean;
};
