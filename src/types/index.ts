
export type Class = {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  createdAt: string; // ISO date string
};

export type Student = {
  id: string;
  name: string;
  avatar: string; // This will be a data URL for Firestore
  classId: string;
};

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  id: string;
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
