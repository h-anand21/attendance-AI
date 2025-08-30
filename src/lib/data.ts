import type { Class, Student } from '@/types';

export const classes: Class[] = [
  { id: 'math-101', name: 'Mathematics 101', section: 'A', studentCount: 30 },
  { id: 'phy-202', name: 'Physics 202', section: 'B', studentCount: 25 },
  { id: 'eng-lit-301', name: 'English Literature 301', section: 'A', studentCount: 35 },
  { id: 'cs-404', name: 'Computer Science 404', section: 'C', studentCount: 28 },
];

export const students: Record<string, Student[]> = {
  'math-101': Array.from({ length: 30 }, (_, i) => ({
    id: `M101-${1001 + i}`,
    name: `Student ${1001 + i}`,
    avatar: `https://picsum.photos/seed/${1001 + i}/40/40`,
  })),
  'phy-202': Array.from({ length: 25 }, (_, i) => ({
    id: `P202-${2001 + i}`,
    name: `Student ${2001 + i}`,
    avatar: `https://picsum.photos/seed/${2001 + i}/40/40`,
  })),
  'eng-lit-301': Array.from({ length: 35 }, (_, i) => ({
    id: `E301-${3001 + i}`,
    name: `Student ${3001 + i}`,
    avatar: `https://picsum.photos/seed/${3001 + i}/40/40`,
  })),
  'cs-404': Array.from({ length: 28 }, (_, i) => ({
    id: `C404-${4001 + i}`,
    name: `Student ${4001 + i}`,
    avatar: `https://picsum.photos/seed/${4001 + i}/40/40`,
  })),
};
