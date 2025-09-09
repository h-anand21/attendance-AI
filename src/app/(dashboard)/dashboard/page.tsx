
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
import { subDays, format, eachDayOfInterval, formatDistanceToNow } from 'date-fns';
import type { AttendanceStatus, Notice } from '@/types';
import { PublishNoticeDialog } from './publish-notice-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useNotices } from '@/hooks/use-notices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export default function DashboardPage() {
  const { classes, loading: classesLoading, addClass } = useClasses();
  const { studentsByClass, loading: studentsLoading } = useStudents();
  const { attendanceRecords, loading: attendanceLoading } = useAttendance();
  const { userRole } = useAuth();
  const { notices, addNotice, deleteNotice, loading: noticesLoading } = useNotices();

  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  
  const totalStudents = useMemo(() => {
    return Object.values(studentsByClass).reduce(
      (acc, classStudents) => acc + classStudents.length,
      0
    );
  }, [studentsByClass]);

  const loading = classesLoading || studentsLoading || attendanceLoading || noticesLoading;

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

  const getFormattedNoticeTime = (isoDate: string) => {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
  }

  const { pieChartData, barChartData } = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    
    const fromDateStr = format(thirtyDaysAgo, 'yyyy-MM-dd');
    const toDateStr = format(today, 'yyyy-MM-dd');

    const relevantRecords = attendanceRecords.filter(r => r.date >= fromDateStr && r.date <= toDateStr);

    const pieData = relevantRecords.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<AttendanceStatus, number>);

    const pieChartData = Object.entries(pieData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
    
    const dailyData: { [date: string]: { present: number; absent: number; late: number } } = {};
    const dateInterval = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    dateInterval.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        dailyData[dateStr] = { present: 0, absent: 0, late: 0 };
    });
    
    relevantRecords.forEach(record => {
      if (dailyData[record.date]) {
        dailyData[record.date][record.status]++;
      }
    });

    const barChartData = Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }));

    return { pieChartData, barChartData };

  }, [attendanceRecords]);

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Classes',
      value: classes.length,
      icon: BookOpen,
      description: null,
      action: null,
    },
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      description: null,
      action: null,
    },
    {
      title: 'Attendance Events',
      value: attendanceRecords.length,
      icon: UserCheck,
      description: 'Total records logged',
      action: null,
    },
    {
      title: 'AI Summary',
      value: null,
      icon: TrendingUp,
      description: '30-day attendance trends',
      action: (
        <button
          onClick={handleGenerateSummary}
          className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative animate-rainbow cursor-pointer border-0 bg-[linear-gradient(hsl(var(--card)),hsl(var(--card))),linear-gradient(hsl(var(--card))_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] hover:scale-105 active:scale-95 h-10 px-4 py-2 inline-flex w-full mt-2"
        >
          Get Insights
        </button>
      ),
    },
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className={cn(
              "h-full transition-all duration-300 flex flex-col",
              card.title === 'AI Summary' && 'border-primary/50'
            )}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium">{card.title}</CardTitle>
                <card.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-1 flex-grow flex flex-col justify-center">
                {card.value !== null && (
                  <div className="text-3xl font-bold">{card.value}</div>
                )}
                {card.description && (
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                )}
                {card.action && <div className="pt-2">{card.action}</div>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <AttendanceBarChart data={barChartData} />
        </div>
        <div className="md:col-span-1">
             <AttendancePieChart data={pieChartData} title="Last 30 Days" description="Overall attendance status" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-7">
        <motion.div className="lg:col-span-5 space-y-4" custom={4} initial="hidden" animate="visible" variants={cardVariants}>
            <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
                      Your Classes
                  </h2>
                  <CreateClassDialog onClassCreate={addClass}>
                    <button
                        className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-transform duration-200 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative animate-rainbow cursor-pointer border-0 bg-[linear-gradient(hsl(var(--card)),hsl(var(--card))),linear-gradient(hsl(var(--card))_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] bg-[length:200%] text-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[0] before:h-[20%] before:w-[60%] before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] before:[filter:blur(calc(0.8*1rem))] dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(0,100%,63%),hsl(90,100%,63%),hsl(210,100%,63%),hsl(195,100%,63%),hsl(270,100%,63%))] hover:scale-105 active:scale-95 h-10 px-4 py-2 inline-flex"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Class
                      </button>
                  </CreateClassDialog>
                </div>
                {classes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls, index) => (
                       <motion.div
                        key={cls.id}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Link 
                          href={`/attendance/${cls.id}`} 
                          className="group"
                        >
                          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-md hover:shadow-primary/20 transition-all duration-300 h-full flex flex-col">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{cls.name}</CardTitle>
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
                      </motion.div>
                    ))}
                </div>
                ) : (
                <Card className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 shadow-md">
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
        </motion.div>

        <motion.div className="lg:col-span-2 space-y-4" custom={5} initial="hidden" animate="visible" variants={cardVariants}>
             <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg"><Megaphone className="h-5 w-5" /> Notice Board</CardTitle>
                    {userRole === 'admin' && (
                        <PublishNoticeDialog onPublish={addNotice}>
                            <Button variant="outline" size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Publish
                            </Button>
                        </PublishNoticeDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                   <div className="space-y-3">
                     {notices.length > 0 ? notices.slice(0, 5).map((notice) => (
                        <Alert key={notice.id} className="relative pr-10 text-xs bg-black/20 border-white/10">
                           <AlertTitle className="text-xs font-semibold mb-1">{notice.title}</AlertTitle>
                           <AlertDescription>{getFormattedNoticeTime(notice.createdAt)}</AlertDescription>
                           {userRole === 'admin' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute top-1/2 right-0 -translate-y-1/2 h-7 w-7">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => deleteNotice(notice.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                           )}
                        </Alert>
                     )) : (
                        <div className="text-center text-sm text-muted-foreground py-4">No notices yet.</div>
                     )}
                     {notices.length > 5 && <Button variant="outline" size="sm" className="w-full">View All Notices</Button> }
                   </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>

       <Dialog open={isSummaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="bg-background/80 backdrop-blur-md border-white/20">
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
            <div className="prose prose-sm dark:prose-invert max-h-60 overflow-y-auto bg-black/20 p-4 rounded-md">
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

    

    