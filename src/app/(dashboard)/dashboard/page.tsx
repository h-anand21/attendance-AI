'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card';
import { useClasses } from '@/hooks/use-classes';
import { useStudents } from '@/hooks/use-students';
import { Users, BookOpen, Loader2, PlusCircle, TrendingUp, UserCheck, Megaphone, MoreVertical, Trash2 } from 'lucide-react';
import { GlassBadge } from '@/components/ui/glass-badge';
import { useMemo, useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
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
import type { AttendanceStatus } from '@/types';
import { PublishNoticeDialog } from './publish-notice-dialog';
import { CreateClassDialog } from './create-class-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useNotices } from '@/hooks/use-notices';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const { user, userRole } = useAuth();
  const { notices, addNotice, deleteNotice, loading: noticesLoading } = useNotices();

  const [isSummaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  
  const totalStudents = useMemo(() => {
    const existingClassIds = new Set(classes.map(c => c.id));
    return Object.entries(studentsByClass)
      .filter(([classId]) => existingClassIds.has(classId))
      .reduce((acc, [, classStudents]) => acc + classStudents.length, 0);
  }, [studentsByClass, classes]);

  const validAttendanceRecords = useMemo(() => {
    const existingClassIds = new Set(classes.map(c => c.id));
    return attendanceRecords.filter(r => r.classId && existingClassIds.has(r.classId));
  }, [attendanceRecords, classes]);

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

    const relevantRecords = validAttendanceRecords.filter(r => r.date >= fromDateStr && r.date <= toDateStr);

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

  }, [validAttendanceRecords]);

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
      value: validAttendanceRecords.length,
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
        <GlassButton
          variant="primary"
          onClick={handleGenerateSummary}
          className="w-full mt-2 h-10"
        >
          Get Insights
        </GlassButton>
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
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <GlassCard className={cn(
              "h-full transition-all duration-300 flex flex-col border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none",
              card.title === 'AI Summary' && 'border-primary/50 bg-primary/5'
            )}>
              <GlassCardHeader className="flex flex-row items-center justify-between pb-4">
                <GlassCardTitle className="text-sm font-medium text-muted-foreground">{card.title}</GlassCardTitle>
                <card.icon className="h-5 w-5 text-primary/70" />
              </GlassCardHeader>
              <GlassCardContent className="space-y-1 flex-grow flex flex-col justify-center">
                {card.value !== null && (
                  <div className="text-3xl font-bold tracking-tight">{card.value}</div>
                )}
                {card.description && (
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                )}
                {card.action && <div className="pt-2">{card.action}</div>}
              </GlassCardContent>
            </GlassCard>
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
                  <h2 className="text-2xl font-bold tracking-tight">
                      Your Classes
                  </h2>
                  <CreateClassDialog onClassCreate={addClass}>
                    <GlassButton variant="primary" size="sm" className="h-9">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Class
                    </GlassButton>
                  </CreateClassDialog>
                </div>
                {classes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((cls, index) => (
                       <motion.div
                        key={cls.id}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Link 
                          href={`/attendance/${cls.id}`} 
                          className="group"
                        >
                          <GlassCard className="border-slate-200/80 dark:border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col p-2 shadow-sm dark:shadow-none">
                            <GlassCardHeader>
                              <div className="flex justify-between items-start">
                                <GlassCardTitle className="text-lg group-hover:text-primary transition-colors">{cls.name}</GlassCardTitle>
                                <GlassBadge variant="secondary" className="text-xs">Sec. {cls.section}</GlassBadge>
                              </div>
                              <GlassCardDescription className="text-xs">Click to start attendance</GlassCardDescription>
                            </GlassCardHeader>
                            <GlassCardContent className="mt-auto">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{(studentsByClass[cls.id] || []).length} Students</span>
                              </div>
                            </GlassCardContent>
                          </GlassCard>
                        </Link>
                      </motion.div>
                    ))}
                </div>
                ) : (
                <GlassCard className="text-center py-12 border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
                    <GlassCardContent>
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold mb-2">No Classes Found</h3>
                        <p className="text-muted-foreground mb-4">Create a new class to get started.</p>
                        <CreateClassDialog onClassCreate={addClass}>
                          <GlassButton variant="primary">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Create Your First Class
                          </GlassButton>
                        </CreateClassDialog>
                    </GlassCardContent>
                </GlassCard>
                )}
            </div>
        </motion.div>

        <motion.div className="lg:col-span-2 space-y-4" custom={5} initial="hidden" animate="visible" variants={cardVariants}>
             <GlassCard className="border-slate-200/80 dark:border-white/10 h-full flex flex-col shadow-sm dark:shadow-none">
                <GlassCardHeader>
                  <div className="flex justify-between items-center">
                    <GlassCardTitle className="flex items-center gap-2 text-lg font-bold"><Megaphone className="h-5 w-5 text-primary" /> Notice Board</GlassCardTitle>
                    {userRole === 'admin' && (
                        <PublishNoticeDialog onPublish={addNotice}>
                            <GlassButton variant="primary" size="sm" className="h-8 px-3 text-xs">
                                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                                Publish
                            </GlassButton>
                        </PublishNoticeDialog>
                    )}
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="flex-grow">
                   <div className="space-y-3">
                     {notices.length > 0 ? notices.slice(0, 5).map((notice) => (
                        <Alert key={notice.id} className="relative pr-10 text-xs bg-white/70 dark:bg-white/5 border-slate-200/80 dark:border-white/10 rounded-xl backdrop-blur-md shadow-xs">
                           <AlertTitle className="text-xs font-semibold mb-1">{notice.title}</AlertTitle>
                           <AlertDescription className="text-[10px] text-muted-foreground">{getFormattedNoticeTime(notice.createdAt)}</AlertDescription>
                           {userRole === 'admin' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="glass">
                                    <DropdownMenuItem onClick={() => deleteNotice(notice.id)} className="text-destructive focus:bg-destructive/10">
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
                     {notices.length > 5 && <GlassButton variant="outline" size="sm" className="w-full text-xs h-8">View All Notices</GlassButton> }
                   </div>
                </GlassCardContent>
            </GlassCard>
        </motion.div>
      </div>

        <Dialog open={isSummaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="glass border-slate-200/80 dark:border-white/20 p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">AI Attendance Summary</DialogTitle>
            <DialogDescription className="text-base">
              Analysis of trends across all classes for the last 30 days.
            </DialogDescription>
          </DialogHeader>
          {isSummaryLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-h-80 overflow-y-auto bg-slate-100/70 dark:bg-black/20 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10">
              <p className="text-base leading-relaxed">{summary}</p>
            </div>
          )}
          <DialogFooter className="pt-4">
            <GlassButton onClick={() => setSummaryModalOpen(false)} className="w-full sm:w-auto">Close Insights</GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}