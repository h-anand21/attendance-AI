
'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { Users, BookOpen, Loader2, PlusCircle, TrendingUp, UserCheck, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateClassDialog } from './create-class-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { generateAttendanceSummary } from '@/ai/flows/generate-attendance-summary';
import { useAttendance } from '@/hooks/use-attendance';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AttendancePieChart } from '@/app/reports/attendance-pie-chart';
import { AttendanceBarChart } from '@/app/reports/attendance-bar-chart';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import type { AttendanceStatus, Notice } from '@/types';
import { PublishNoticeDialog } from './publish-notice-dialog';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';


export default function DashboardPage() {
  const { classes, loading: classesLoading, addClass } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { userRole } = useAuth();

  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, title: "Results for Class IX out now!", time: "Today, 11:00 am" },
    { id: 2, title: "Parent-Teacher meeting scheduled.", time: "Yesterday, 3:00 pm" },
    { id: 3, title: "Annual sports day next week.", time: "2 days ago, 10:00 am" },
  ]);

  const totalStudents = useMemo(() => {
    return Object.values(studentsByClass).reduce(
      (acc, classStudents) => acc + classStudents.length,
      0
    );
  }, [studentsByClass]);

  const loading = classesLoading || studentsLoading || attendanceLoading;

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryModalOpen(true);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const result = await generateAttendanceSummary({
        classId: 'all_classes',
        startDate: thirtyDaysAgo.toISOString(),
        endDate: today.toISOString(),
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Sorry, I couldn't generate a summary at this time. Please try again later.");
    } finally {
      setSummaryLoading(false);
    }
  };
  
  const handlePublishNotice = (notice: Omit<Notice, 'time' | 'id'>) => {
    const newNotice: Notice = {
        id: Date.now(),
        ...notice,
        time: format(new Date(), "'Today,' h:mm a"),
    };
    setNotices(prevNotices => [newNotice, ...prevNotices]);
  }

  const handleDeleteNotice = (id: number) => {
    setNotices(prevNotices => prevNotices.filter(notice => notice.id !== id));
  }

  const StatCard = ({ title, value, icon, description }: { title: string; value: string | number | React.ReactNode; icon: React.ReactNode, description?: string }) => (
    <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )

  const dateRange = useMemo(() => ({
    from: subDays(new Date(), 29),
    to: new Date(),
  }), []);

  const filteredRecords = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const fromDate = format(dateRange.from, 'yyyy-MM-dd');
    const toDate = format(new Date(), 'yyyy-MM-dd'); 

    return attendanceRecords.filter(
      (r) =>
        r.date >= fromDate &&
        r.date <= toDate
    );
  }, [attendanceRecords, dateRange]);


  const pieChartData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    
    const statusCounts = filteredRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<AttendanceStatus, number>);

    return Object.entries(statusCounts)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
  }, [filteredRecords]);

  const barChartData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const dailyData: { [date: string]: { present: number; absent: number; late: number } } = {};
    const interval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

    interval.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        dailyData[dateStr] = { present: 0, absent: 0, late: 0 };
    });

    filteredRecords.forEach(record => {
      if (dailyData[record.date]) {
        dailyData[record.date][record.status]++;
      }
    });

    return Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }));
  }, [filteredRecords, dateRange]);


  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Classes" value={classes.length} icon={<BookOpen className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Students" value={totalStudents} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Attendance Events" value={attendanceRecords.length} icon={<UserCheck className="h-5 w-5 text-muted-foreground" />} description="Total records logged" />
        <StatCard title="AI Summary" value={<Button size="sm" className="w-full bg-accent hover:bg-accent/90" onClick={handleGenerateSummary}>Get Insights</Button>} icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />} description="30-day attendance trends" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                 <AttendancePieChart data={pieChartData} />
              </div>
              <div className="md:col-span-2">
                  <AttendanceBarChart data={barChartData} />
              </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold tracking-tight">
                    Your Classes
                </h2>
                <CreateClassDialog onClassCreate={addClass}>
                    <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Class
                    </Button>
                </CreateClassDialog>
                </div>
                {classes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {classes.map((cls) => (
                    <Link href={`/attendance/${cls.id}`} key={cls.id}>
                        <Card className="hover:border-primary/80 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group bg-gradient-to-br from-card to-secondary/50">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{cls.name}</CardTitle>
                            <Badge variant="secondary">Sec. {cls.section}</Badge>
                            </div>
                            <CardDescription>Click to start attendance</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{(studentsByClass[cls.id] || []).length} Students</span>
                            </div>
                        </CardContent>
                        </Card>
                    </Link>
                    ))}
                </div>
                ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Classes Found</h3>
                        <p className="text-muted-foreground mb-4">Create a new class to get started.</p>
                        <CreateClassDialog onClassCreate={addClass}>
                            <Button variant="default">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Your First Class
                            </Button>
                        </CreateClassDialog>
                    </CardContent>
                </Card>
                )}
            </div>
        </div>

        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Notice Board</CardTitle>
                    {userRole === 'admin' && (
                        <PublishNoticeDialog onPublish={handlePublishNotice}>
                            <Button variant="ghost" size="icon">
                                <PlusCircle className="h-5 w-5" />
                                <span className="sr-only">Publish new notice</span>
                            </Button>
                        </PublishNoticeDialog>
                    )}
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     {notices.map((notice, index) => (
                        <Alert key={index} className="relative pr-10">
                           <AlertTitle className="text-sm font-semibold">{notice.title}</AlertTitle>
                           <AlertDescription className="text-xs text-muted-foreground">{notice.time}</AlertDescription>
                           {userRole === 'admin' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleDeleteNotice(notice.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                           )}
                        </Alert>
                     ))}
                     <Button variant="outline" className="w-full">View All Notices</Button>
                   </div>
                </CardContent>
            </Card>
        </div>
      </div>

       <Dialog open={isSummaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Attendance Summary (Last 30 Days)</DialogTitle>
            <DialogDescription>
              Here is an AI-generated summary of attendance trends across all classes.
            </DialogDescription>
          </DialogHeader>
          {isSummaryLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-h-60 overflow-y-auto bg-secondary/50 p-4 rounded-md">
              <p>{summary}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSummaryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
