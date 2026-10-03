'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ClipboardCheck,
  UtensilsCrossed,
  Users,
  User,
  LineChart,
  Moon,
  Bell,
  ChevronDown,
  Calendar as CalendarIcon,
  Download,
  AlertTriangle,
  CheckCircle2,
  ScanFace,
  QrCode,
  TrendingUp,
  UserCheck,
  BookOpen,
  PlusCircle,
  Megaphone,
  Check,
  Search,
  Sparkles,
  Camera,
  X
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AttendanceBarChart } from '@/app/reports/attendance-bar-chart';
import { AttendancePieChart } from '@/app/reports/attendance-pie-chart';

type NavTab = 'Dashboard' | 'Attendance' | 'Meal Verification' | 'Student Directory' | 'Teacher Directory' | 'Reports';

export function DashboardReplica() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');

  // Dashboard state
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);

  // Reports state
  const [selectedClass, setSelectedClass] = useState<'class 9 - Section A' | 'class 10 - Section B'>('class 9 - Section A');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState<'official' | 'live' | '7days'>('official');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showAiNotice, setShowAiNotice] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Attendance tab state
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState('Class 9 - Section A');
  const [webAttStatus, setWebAttStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    '01': 'present',
    '02': 'present',
    '03': 'absent',
    '04': 'present',
    '05': 'present',
  });
  const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);

  // Meal verification state
  const [mealStatus, setMealStatus] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
    '03': false,
    '04': true,
  });

  // Directory search query
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = useMemo(() => new Date(), []);

  // Format date range for Reports
  const formattedDateRange = useMemo(() => {
    if (selectedDatePreset === 'official') {
      return 'Sep 06, 2025 - Sep 09, 2025';
    } else if (selectedDatePreset === 'live') {
      return `${format(today, 'dd MMM yyyy')} (Today Live)`;
    } else {
      return `${format(subDays(today, 6), 'dd MMM yyyy')} - ${format(today, 'dd MMM yyyy')}`;
    }
  }, [selectedDatePreset, today]);

  // Authentic 7-day trend data for Dashboard matching real AttendanceBarChart
  const dashboardBarData = useMemo(() => [
    { date: '2025-09-03', present: 32, absent: 6, late: 0 },
    { date: '2025-09-04', present: 34, absent: 4, late: 0 },
    { date: '2025-09-05', present: 30, absent: 8, late: 0 },
    { date: '2025-09-06', present: 35, absent: 3, late: 0 },
    { date: '2025-09-07', present: 36, absent: 2, late: 0 },
    { date: '2025-09-08', present: 33, absent: 5, late: 0 },
    { date: '2025-09-09', present: 36, absent: 2, late: 0 },
  ], []);

  // Authentic pie data for Dashboard
  const dashboardPieData = useMemo(() => [
    { name: 'Present', value: 138 },
    { name: 'Absent', value: 18 },
    { name: 'Late', value: 2 },
  ], []);

  // Reports data matching public/image.png
  const reportsBarData = useMemo(() => [
    { date: '2025-09-06', present: 0, absent: 2, late: 0 },
    { date: '2025-09-07', present: 1, absent: 3, late: 0 },
    { date: '2025-09-08', present: 1, absent: 4, late: 0 },
    { date: '2025-09-09', present: 2, absent: 3, late: 0 },
  ], []);

  const reportsPieData = useMemo(() => [
    { name: 'Present', value: 4 },
    { name: 'Absent', value: 12 },
  ], []);

  const handleAiAnalyze = () => {
    setIsAiAnalyzing(true);
    setShowAiNotice(false);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setShowAiNotice(true);
    }, 1200);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Authentic Nav Links from real GlassSidebar
  const navItems = [
    { label: 'Dashboard' as NavTab, icon: <Home className="w-4 h-4" /> },
    { label: 'Attendance' as NavTab, icon: <ClipboardCheck className="w-4 h-4" /> },
    { label: 'Meal Verification' as NavTab, icon: <UtensilsCrossed className="w-4 h-4" /> },
    { label: 'Student Directory' as NavTab, icon: <Users className="w-4 h-4" /> },
    { label: 'Teacher Directory' as NavTab, icon: <User className="w-4 h-4" /> },
    { label: 'Reports' as NavTab, icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#090C12] border border-slate-800 shadow-2xl overflow-hidden text-slate-200 font-sans select-none relative">
      {/* Top simulated browser frame bar */}
      <div className="bg-[#06080E] px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-mono text-slate-400 hidden sm:inline text-[11px]">
            AttendEase Cloud Portal • {activeTab}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Session • Cloud Connected</span>
          </span>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Content) */}
      <div className="flex min-h-[640px] bg-[#090C12]">
        {/* ======================================================== */}
        {/* SIDEBAR: Exact Real Logo & Navigation from GlassSidebar */}
        {/* ======================================================== */}
        <aside className="w-48 sm:w-52 bg-[#06080E] border-r border-slate-800/70 flex flex-col justify-between p-4 flex-shrink-0">
          <div>
            {/* REAL LOGO: Authentic Green Circle + White Checkmark + AttendEase */}
            <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.45)] shrink-0">
                <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                AttendEase
              </span>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left relative ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#EAB308] rounded-r-md shadow-[0_0_8px_#EAB308]" />
                    )}
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer in Sidebar: HIMANSHU ... */}
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-transparent hover:bg-white/5 cursor-pointer transition">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 overflow-hidden ring-1 ring-white/10">
              HA
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-white uppercase tracking-wide truncate">HIMANSHU ...</span>
              <span className="text-[9px] text-slate-500 font-mono truncate">himanshuanand5...</span>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN DYNAMIC CONTENT AREA */}
        {/* ======================================================== */}
        <main className="flex-1 p-4 md:p-6 flex flex-col justify-between overflow-x-hidden relative bg-[#090C12]">
          {/* Header Row: Title + Moon + Bell Icons */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {activeTab === 'Dashboard' && 'Dashboard'}
                {activeTab === 'Attendance' && 'Attendance Roll Call'}
                {activeTab === 'Meal Verification' && 'Mid-Day Meal Verification'}
                {activeTab === 'Student Directory' && 'Student Directory'}
                {activeTab === 'Teacher Directory' && 'Teacher Directory'}
                {activeTab === 'Reports' && 'Attendance Reports'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Moon className="w-4 h-4" />
              </div>
              <div className="relative p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#EAB308] absolute top-1 right-1" />
              </div>
            </div>
          </div>

          {/* DYNAMIC TAB VIEWS */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* ======================================================== */}
              {/* TAB 1: DASHBOARD (Exact Replica of src/app/(dashboard)/dashboard/page.tsx) */}
              {/* ======================================================== */}
              {activeTab === 'Dashboard' && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Top 4 Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Classes */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                        <span>Total Classes</span>
                        <BookOpen className="w-4 h-4 text-primary/70" />
                      </div>
                      <div className="text-3xl font-bold text-white mt-2">2</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Active grade sections</div>
                    </div>

                    {/* Card 2: Total Students */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                        <span>Total Students</span>
                        <Users className="w-4 h-4 text-primary/70" />
                      </div>
                      <div className="text-3xl font-bold text-white mt-2">38</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Biometrically registered</div>
                    </div>

                    {/* Card 3: Attendance Events */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                        <span>Attendance Events</span>
                        <UserCheck className="w-4 h-4 text-primary/70" />
                      </div>
                      <div className="text-3xl font-bold text-white mt-2">156</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Total records logged</div>
                    </div>

                    {/* Card 4: AI Summary */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                        <span className="text-amber-400 font-bold">AI Summary</span>
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">30-day attendance trends</p>
                      <button
                        onClick={() => setIsAiSummaryOpen(!isAiSummaryOpen)}
                        className="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition"
                      >
                        {isAiSummaryOpen ? 'Hide Insights' : 'Get Insights'}
                      </button>
                    </div>
                  </div>

                  {/* AI Summary Notice Box */}
                  {isAiSummaryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-amber-300 text-xs flex items-start gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">GenAI Biometric Insights:</span>
                        Overall campus attendance averaged 91.2% over the last 30 days. Class 9-A maintained 94.0% consistency with zero anomalies. High punctuality across morning roll calls.
                      </div>
                    </motion.div>
                  )}

                  {/* Real Recharts Charts Grid: Daily Trends (col-span-2) + Last 30 Days (col-span-1) */}
                  {mounted && (
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <AttendanceBarChart data={dashboardBarData} />
                      </div>
                      <div className="md:col-span-1">
                        <AttendancePieChart
                          data={dashboardPieData}
                          title="Last 30 Days"
                          description="Overall attendance status"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Row: Your Classes (col-span-5) + Notice Board (col-span-2) */}
                  <div className="grid gap-6 lg:grid-cols-7">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Your Classes</h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition">
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>New Class</span>
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Class 1 */}
                        <div
                          onClick={() => {
                            setSelectedAttendanceClass('Class 9 - Section A');
                            setActiveTab('Attendance');
                          }}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-white text-base">Class 9</div>
                              <div className="text-xs text-muted-foreground mt-0.5">Click to start attendance</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                              Sec. A
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span>14 Students</span>
                          </div>
                        </div>

                        {/* Class 2 */}
                        <div
                          onClick={() => {
                            setSelectedAttendanceClass('Class 10 - Section B');
                            setActiveTab('Attendance');
                          }}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-white text-base">Class 10</div>
                              <div className="text-xs text-muted-foreground mt-0.5">Click to start attendance</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                              Sec. B
                            </span>
                          </div>
                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span>24 Students</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notice Board */}
                    <div className="lg:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm font-bold text-white">
                            <Megaphone className="w-4 h-4 text-primary" />
                            <span>Notice Board</span>
                          </div>
                          <button className="px-2 py-1 rounded bg-primary text-primary-foreground font-bold text-[10px]">
                            Publish
                          </button>
                        </div>
                        <div className="space-y-2.5">
                          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                            <div className="font-semibold text-white">Biometric Face Audit Scheduled</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">2 hours ago</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                            <div className="font-semibold text-white">Mid-Day Meal Verification Active</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Yesterday</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: REPORTS (Exact match with public/image.png) */}
              {/* ======================================================== */}
              {activeTab === 'Reports' && (
                <motion.div
                  key="tab-reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Filter Reports Card */}
                  <div className="p-4 rounded-xl bg-[#0F131C] border border-slate-800/80">
                    <div className="text-sm font-bold text-white mb-0.5">Filter Reports</div>
                    <div className="text-xs text-slate-400 mb-3.5">
                      Select a class and a date range to view the attendance report.
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Class Selector Dropdown */}
                      <div className="relative flex-1 min-w-[180px]">
                        <button
                          onClick={() => {
                            setIsClassDropdownOpen(!isClassDropdownOpen);
                            setIsDateDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0A0D15] border border-slate-800 text-xs text-slate-200 hover:border-slate-600 transition-colors"
                        >
                          <span>{selectedClass}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2" />
                        </button>

                        {isClassDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-full bg-[#121622] border border-slate-700 rounded-lg shadow-2xl py-1 z-30">
                            {(['class 9 - Section A', 'class 10 - Section B'] as const).map((cls) => (
                              <div
                                key={cls}
                                onClick={() => {
                                  setSelectedClass(cls);
                                  setIsClassDropdownOpen(false);
                                }}
                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-white/10 transition-colors ${
                                  selectedClass === cls ? 'text-[#FACC15] font-semibold' : 'text-slate-300'
                                }`}
                              >
                                {cls}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Date Range Box & Picker Popover */}
                      <div className="relative flex-1 min-w-[210px]">
                        <button
                          onClick={() => {
                            setIsDateDropdownOpen(!isDateDropdownOpen);
                            setIsClassDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0A0D15] border border-slate-800 text-xs text-slate-200 hover:border-slate-600 transition-colors"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{formattedDateRange}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" />
                        </button>

                        {isDateDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-[#121622] border border-slate-700 rounded-lg shadow-2xl py-1.5 z-30">
                            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Choose Audit Range
                            </div>
                            <div
                              onClick={() => {
                                setSelectedDatePreset('official');
                                setIsDateDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-white/10 flex items-center justify-between ${
                                selectedDatePreset === 'official' ? 'text-[#FACC15] font-bold' : 'text-slate-300'
                              }`}
                            >
                              <span>Sep 06, 2025 - Sep 09, 2025</span>
                              {selectedDatePreset === 'official' && <Check className="w-3 h-3 text-[#FACC15]" />}
                            </div>
                            <div
                              onClick={() => {
                                setSelectedDatePreset('live');
                                setIsDateDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-white/10 flex items-center justify-between ${
                                selectedDatePreset === 'live' ? 'text-[#FACC15] font-bold' : 'text-slate-300'
                              }`}
                            >
                              <span>{format(today, 'dd MMM yyyy')} (Today Live)</span>
                              {selectedDatePreset === 'live' && <Check className="w-3 h-3 text-[#FACC15]" />}
                            </div>
                            <div
                              onClick={() => {
                                setSelectedDatePreset('7days');
                                setIsDateDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs cursor-pointer hover:bg-white/10 flex items-center justify-between ${
                                selectedDatePreset === '7days' ? 'text-[#FACC15] font-bold' : 'text-slate-300'
                              }`}
                            >
                              <span>Last 7 Days Rolling</span>
                              {selectedDatePreset === '7days' && <Check className="w-3 h-3 text-[#FACC15]" />}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Button 1: Analyze with AI */}
                      <button
                        onClick={handleAiAnalyze}
                        disabled={isAiAnalyzing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-slate-950" />
                        <span>{isAiAnalyzing ? 'Analyzing AI...' : 'Analyze with AI'}</span>
                      </button>

                      {/* Button 2: Download Report */}
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
                      >
                        {downloadSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                            <span>Download Report</span>
                          </>
                        )}
                      </button>
                    </div>

                    {showAiNotice && (
                      <div className="mt-3 p-2.5 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FACC15] shrink-0" />
                        <span>AI Anomaly Scanner: All 16 biometric records verified. Attendance pattern is consistent.</span>
                      </div>
                    )}
                  </div>

                  {/* Real Recharts Charts Grid for Reports */}
                  {mounted && (
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <AttendancePieChart
                          data={reportsPieData}
                          title="Overall Status"
                          description="Summary for the selected date range"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <AttendanceBarChart data={reportsBarData} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ATTENDANCE ROLL CALL (Real Attendance Session) */}
              {/* ======================================================== */}
              {activeTab === 'Attendance' && (
                <motion.div
                  key="tab-attendance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{selectedAttendanceClass}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                          Live Session Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Biometric camera roll call with manual override and QR scanning.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setIsFaceScanOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition"
                      >
                        <ScanFace className="w-4 h-4" />
                        <span>Face Scan</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition border border-white/10">
                        <QrCode className="w-4 h-4" />
                        <span>QR Code</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition border border-white/10">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Attendance Table */}
                  <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 grid grid-cols-12 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span className="col-span-5">Student Name</span>
                      <span className="col-span-3 text-center">Roll No</span>
                      <span className="col-span-4 text-right">Status Action</span>
                    </div>

                    {[
                      { roll: '01', name: 'Himanshu Anand', id: '01' },
                      { roll: '02', name: 'Yash Anand', id: '02' },
                      { roll: '03', name: 'Ankit Kumar', id: '03' },
                      { roll: '04', name: 'Rohan Verma', id: '04' },
                      { roll: '05', name: 'Priya Singh', id: '05' },
                    ].map((s) => {
                      const st = webAttStatus[s.id] || 'absent';
                      return (
                        <div key={s.id} className="px-4 py-2.5 border-b border-white/5 grid grid-cols-12 items-center text-xs">
                          <div className="col-span-5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
                              {s.name[0]}
                            </div>
                            <span className="font-semibold text-white">{s.name}</span>
                          </div>
                          <span className="col-span-3 text-center font-mono text-muted-foreground">{s.roll}</span>
                          <div className="col-span-4 flex justify-end gap-1.5">
                            <button
                              onClick={() => setWebAttStatus({ ...webAttStatus, [s.id]: 'present' })}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                st === 'present'
                                  ? 'bg-emerald-500 text-black shadow-sm'
                                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => setWebAttStatus({ ...webAttStatus, [s.id]: 'absent' })}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                st === 'absent'
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => setWebAttStatus({ ...webAttStatus, [s.id]: 'late' })}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                                st === 'late'
                                  ? 'bg-amber-400 text-black shadow-sm'
                                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                              }`}
                            >
                              Late
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Face Scan Simulator Modal */}
                  {isFaceScanOpen && (
                    <div className="p-4 rounded-xl bg-black border border-primary/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <button
                        onClick={() => setIsFaceScanOpen(false)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        1080p Biometric Camera Feed Active
                      </div>
                      <div className="relative w-64 h-36 border-2 border-primary/60 rounded-xl flex items-center justify-center overflow-hidden bg-slate-950">
                        <motion.div
                          animate={{ y: [-50, 50, -50] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                          className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#22C55E]"
                        />
                        <div className="absolute top-2 left-2 text-[9px] bg-black/80 px-2 py-0.5 rounded border border-emerald-400 text-emerald-300 font-mono">
                          ✓ Face Detected: Himanshu Anand (99.8%)
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MEAL VERIFICATION (Exact match with meal-verification-client.tsx) */}
              {/* ======================================================== */}
              {activeTab === 'Meal Verification' && (
                <motion.div
                  key="tab-meal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Meal Verification Controls</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select a date and scan student QR codes to verify meal distribution.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        <span className="font-mono">{format(today, 'dd MMM yyyy')}</span>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan QR Code</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 grid grid-cols-12 text-[11px] font-bold text-muted-foreground uppercase">
                      <span className="col-span-5">Student</span>
                      <span className="col-span-3 text-center">Class</span>
                      <span className="col-span-4 text-right">Meal Status</span>
                    </div>

                    {[
                      { id: '01', name: 'Himanshu Anand', cls: 'Class 9 - Sec A' },
                      { id: '02', name: 'Yash Anand', cls: 'Class 9 - Sec A' },
                      { id: '03', name: 'Ankit Kumar', cls: 'Class 9 - Sec A' },
                      { id: '04', name: 'Rohan Verma', cls: 'Class 9 - Sec A' },
                    ].map((s) => {
                      const isVerified = mealStatus[s.id];
                      return (
                        <div key={s.id} className="px-4 py-2.5 border-b border-white/5 grid grid-cols-12 items-center text-xs">
                          <span className="col-span-5 font-semibold text-white">{s.name}</span>
                          <span className="col-span-3 text-center text-muted-foreground">{s.cls}</span>
                          <div className="col-span-4 flex justify-end">
                            <button
                              onClick={() => setMealStatus({ ...mealStatus, [s.id]: !isVerified })}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 ${
                                isVerified
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Meal Verified</span>
                                </>
                              ) : (
                                <span>Verify Token</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: STUDENT DIRECTORY (Exact match with registration-client.tsx) */}
              {/* ======================================================== */}
              {activeTab === 'Student Directory' && (
                <motion.div
                  key="tab-students"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search students by name or roll..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 grid grid-cols-12 text-[11px] font-bold text-muted-foreground uppercase">
                      <span className="col-span-5">Student</span>
                      <span className="col-span-3 text-center">Class / Roll</span>
                      <span className="col-span-4 text-right">Biometric Status</span>
                    </div>

                    {[
                      { name: 'Himanshu Anand', roll: '01', cls: 'Class 9 - Sec A', status: 'Enrolled' },
                      { name: 'Yash Anand', roll: '02', cls: 'Class 9 - Sec A', status: 'Enrolled' },
                      { name: 'Ankit Kumar', roll: '03', cls: 'Class 9 - Sec A', status: 'Enrolled' },
                      { name: 'Rohan Verma', roll: '04', cls: 'Class 9 - Sec A', status: 'Enrolled' },
                      { name: 'Priya Singh', roll: '05', cls: 'Class 9 - Sec A', status: 'Enrolled' },
                    ]
                      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((s, i) => (
                        <div key={i} className="px-4 py-2.5 border-b border-white/5 grid grid-cols-12 items-center text-xs">
                          <div className="col-span-5 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                              {s.name[0]}
                            </div>
                            <span className="font-semibold text-white">{s.name}</span>
                          </div>
                          <span className="col-span-3 text-center text-muted-foreground">{s.cls} • #{s.roll}</span>
                          <div className="col-span-4 flex justify-end items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              ✓ {s.status} (1080p)
                            </span>
                            <button className="p-1 rounded text-muted-foreground hover:text-white">
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: TEACHER DIRECTORY (Exact match with teacher-registration-client.tsx) */}
              {/* ======================================================== */}
              {activeTab === 'Teacher Directory' && (
                <motion.div
                  key="tab-teachers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Faculty & Authorized Proctor Directory</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Authorized teachers allowed to initiate mobile roll calls and biometric sync.
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Faculty</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'Himanshu Anand', role: 'Head Teacher & Proctor', classes: 'Class 9-A & Class 10-B', email: 'himanshu@attendease.ai' },
                      { name: 'Yash Anand', role: 'Mathematics Faculty', classes: 'Class 10-B', email: 'yash@attendease.ai' },
                      { name: 'Priya Sharma', role: 'Science Faculty', classes: 'Class 8-C & Class 9-A', email: 'priya@attendease.ai' },
                    ].map((t, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                            {t.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{t.name}</div>
                            <div className="text-[11px] text-muted-foreground">{t.role} • {t.classes}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Active Proctor
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Bar */}
          <div className="pt-3 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>AttendEase Cloud Portal • Interactive Full System</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-mono">Live Biometric Cloud Stream</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
