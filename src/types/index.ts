
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
  qrCode?: string; // data URL of the QR code
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  avatar: string; // This will be a data URL for Firestore
}

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

export type Notice = {
  id: string; // Firestore document ID
  title: string;
  createdAt: string; // ISO date string
  userId: string;
};
