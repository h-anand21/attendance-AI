
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
import { GlowingEffect } from '@/components/ui/glowing-effect';


const classColorAccents = [
  'border-primary',
  'border-green-500',
  'border-yellow-500',
  'border-sky-500',
  'border-orange-500',
  'border-fuchsia-500'
];

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

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  actionButton?: React.ReactNode;
}

const GridItem = ({ icon, title, description, actionButton }: GridItemProps) => {
  return (
    <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3 min-h-[14rem]">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
        <div className="relative flex flex-1 flex-col justify-between gap-3">
          <div className="w-fit rounded-lg border border-gray-600 p-2">
            {icon}
          </div>
          <div className="space-y-3">
            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
              {title}
            </h3>
            <div className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400">
              {description}
            </div>
            {actionButton}
          </div>
        </div>
      </div>
    </div>
  );
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

  const kpiCards = [
    { title: `${classes.length} Classes`, description: 'Total classes managed.', icon: <BookOpen className="h-4 w-4 text-black dark:text-neutral-400" /> },
    { title: `${totalStudents} Students`, description: 'Total students enrolled.', icon: <Users className="h-4 w-4 text-black dark:text-neutral-400" /> },
    { title: `${attendanceRecords.length} Events`, description: 'Total attendance records logged.', icon: <UserCheck className="h-4 w-4 text-black dark:text-neutral-400" /> },
    { title: 'AI Summary', description: '30-day attendance trends.', icon: <TrendingUp className="h-4 w-4 text-black dark:text-neutral-400" />, actionButton: <Button size="sm" className="w-full mt-2" onClick={handleGenerateSummary}>Get Insights</Button> }
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
           <motion.li key={kpi.title} custom={index} initial="hidden" animate="visible" variants={cardVariants} className="list-none">
             <GridItem
                icon={kpi.icon}
                title={kpi.title}
                description={kpi.description}
                actionButton={kpi.actionButton}
              />
           </motion.li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 lg:grid-cols-7">
        <motion.div className="lg:col-span-5 space-y-4" custom={kpiCards.length} initial="hidden" animate="visible" variants={cardVariants}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-3">
                 <AttendanceBarChart data={barChartData} />
              </div>
              <div className="md:col-span-1">
                <AttendancePieChart data={pieChartData} title="Last 30 Days" description="Overall attendance" />
              </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls, index) => (
                      <Link 
                        href={`/attendance/${cls.id}`} 
                        key={cls.id}
                        className="group"
                      >
                        <Card className={cn(
                          "group-hover:shadow-primary/20 group-hover:shadow-lg transition-all duration-300 h-full flex flex-col border-t-4",
                           classColorAccents[index % classColorAccents.length]
                        )}>
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
        </motion.div>

        <motion.div className="lg:col-span-2 space-y-4" custom={kpiCards.length + 1} initial="hidden" animate="visible" variants={cardVariants}>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Megaphone className="h-5 w-5" /> Notice Board</CardTitle>
                    {userRole === 'admin' && (
                        <PublishNoticeDialog onPublish={addNotice}>
                            <Button variant="outline" size="sm" className="absolute top-4 right-4">
                                <PlusCircle className="h-4 w-4" />
                                <span className="sr-only">Publish</span>
                            </Button>
                        </PublishNoticeDialog>
                    )}
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
