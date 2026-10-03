'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck2,
  Utensils,
  Users,
  UserCheck,
  LineChart,
  Moon,
  Bell,
  ChevronDown,
  Calendar as CalendarIcon,
  AlertTriangle,
  Download,
  Sparkles,
  CheckCircle2,
  Check,
  RefreshCw,
  ScanFace,
  QrCode,
  Camera,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface ClassData {
  name: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  trend: {
    day: string;
    present: number;
    absent: number;
    late: number;
  }[];
}

const classDataMap: Record<string, ClassData> = {
  'class 9 - Section A': {
    name: 'class 9 - Section A',
    total: 16,
    present: 4,
    absent: 12,
    late: 0,
    trend: [
      { day: 'Sep 6', present: 0.1, absent: 2.0, late: 0 },
      { day: 'Sep 7', present: 1.0, absent: 2.8, late: 0 },
      { day: 'Sep 8', present: 1.1, absent: 4.0, late: 0 },
      { day: 'Sep 9', present: 2.0, absent: 3.2, late: 0 },
    ],
  },
  'class 10 - Section B': {
    name: 'class 10 - Section B',
    total: 24,
    present: 20,
    absent: 3,
    late: 1,
    trend: [
      { day: 'Sep 6', present: 16, absent: 7, late: 1 },
      { day: 'Sep 7', present: 18, absent: 5, late: 1 },
      { day: 'Sep 8', present: 21, absent: 2, late: 1 },
      { day: 'Sep 9', present: 20, absent: 3, late: 1 },
    ],
  },
};

type NavTab = 'Dashboard' | 'Attendance' | 'Meal Verification' | 'Student Directory' | 'Teacher Directory' | 'Reports';

export function DashboardReplica() {
  const [activeTab, setActiveTab] = useState<NavTab>('Reports');
  const [selectedClass, setSelectedClass] = useState<'class 9 - Section A' | 'class 10 - Section B'>('class 9 - Section A');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showAiNotice, setShowAiNotice] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Attendance tab specific state
  const [webAttStatus, setWebAttStatus] = useState<Record<string, 'present' | 'absent' | 'late'>>({
    '01': 'present',
    '02': 'present',
    '03': 'absent',
    '04': 'present',
  });
  const [isWebScanning, setIsWebScanning] = useState(false);

  const activeData = classDataMap[selectedClass];
  const total = activeData.total;
  const presentPct = activeData.present / total;
  const absentPct = activeData.absent / total;

  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~376.99
  const presentStroke = presentPct * circumference;
  const absentStroke = absentPct * circumference;

  const handleAiAnalyze = () => {
    setIsAiAnalyzing(true);
    setShowAiNotice(false);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setShowAiNotice(true);
    }, 1800);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const navItems = [
    { label: 'Dashboard' as NavTab, icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Attendance' as NavTab, icon: <CalendarCheck2 className="w-4 h-4" /> },
    { label: 'Meal Verification' as NavTab, icon: <Utensils className="w-4 h-4" /> },
    { label: 'Student Directory' as NavTab, icon: <Users className="w-4 h-4" /> },
    { label: 'Teacher Directory' as NavTab, icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Reports' as NavTab, icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#090B10] border-2 border-slate-800 shadow-2xl overflow-hidden text-slate-200 font-sans select-none relative">
      {/* Top simulated browser frame bar */}
      <div className="bg-[#06080C] px-4 py-2 border-b border-slate-800/90 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFB800] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#22C55E] inline-block" />
          <span className="ml-2 font-mono text-slate-400 hidden sm:inline text-[11px]">
            AttendEase Web Portal • {activeTab} View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE INTERACTIVE WEB REPLICA
          </span>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Content) */}
      <div className="flex min-h-[580px] bg-[#0A0C13]">
        {/* ======================================================== */}
        {/* SIDEBAR (Interactive Nav Tabs) */}
        {/* ======================================================== */}
        <aside className="w-52 md:w-60 bg-[#08090E] border-r border-slate-800/80 flex flex-col justify-between p-4 flex-shrink-0">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-black shadow-[0_0_12px_rgba(34,197,94,0.4)]">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">AttendEase</span>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-slate-900/90 text-white border-l-4 border-[#FFB800] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <span className={isActive ? 'text-[#FFB800]' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Footer in Sidebar */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#FF6B35] flex items-center justify-center text-black font-extrabold text-xs">
              HA
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">HIMANSHU ...</span>
              <span className="text-[10px] text-slate-400 truncate">himanshuanand5...</span>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN DYNAMIC CONTENT AREA */}
        {/* ======================================================== */}
        <main className="flex-1 p-5 md:p-7 flex flex-col justify-between overflow-x-hidden relative">
          {/* Header Row: Title + Moon + Bell Icons */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {activeTab === 'Reports' && 'Attendance Reports & Visual Analytics'}
                {activeTab === 'Dashboard' && 'Institution Overview Dashboard'}
                {activeTab === 'Attendance' && 'Web Attendance Roll Call Session'}
                {activeTab === 'Meal Verification' && 'Mid-Day Meal Biometric Tracker'}
                {activeTab === 'Student Directory' && 'Verified Student Directory'}
                {activeTab === 'Teacher Directory' && 'Faculty & Teacher Directory'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#FFB800]/15 text-[#FFB800] text-[10px] font-mono font-bold border border-[#FFB800]/30 hidden sm:inline-block">
                Web Cloud v1.0.1
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Moon className="w-4 h-4" />
              </div>
              <div className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] absolute top-1.5 right-1.5 ring-2 ring-[#0A0C13]" />
              </div>
            </div>
          </div>

          {/* DYNAMIC TAB VIEWS */}
          <div className="flex-1 my-4">
            <AnimatePresence mode="wait">
              {/* ======================================================== */}
              {/* TAB 1: REPORTS (image.png Replica) */}
              {/* ======================================================== */}
              {activeTab === 'Reports' && (
                <motion.div
                  key="tab-reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Filter Reports Bar */}
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800/80">
                    <div className="text-xs font-bold text-white mb-1">Filter Reports</div>
                    <div className="text-[11px] text-slate-400 mb-3">Select a class and a date range to view the attendance report.</div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Class Selector Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                            className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-black border border-slate-700 text-xs font-semibold text-white hover:border-[#FFB800] transition-colors min-w-[190px]"
                          >
                            <span>{selectedClass}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {isClassDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-[#111420] border-2 border-slate-700 rounded-lg shadow-2xl py-1 z-20">
                              {(['class 9 - Section A', 'class 10 - Section B'] as const).map((cls) => (
                                <div
                                  key={cls}
                                  onClick={() => {
                                    setSelectedClass(cls);
                                    setIsClassDropdownOpen(false);
                                  }}
                                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-[#FFB800] hover:text-black font-semibold transition-colors ${
                                    selectedClass === cls ? 'bg-slate-800 text-[#FFB800]' : 'text-slate-300'
                                  }`}
                                >
                                  {cls}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Date Range Picker Input */}
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black border border-slate-700 text-xs text-slate-300">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">Sep 06, 2025 - Sep 09, 2025</span>
                        </div>
                      </div>

                      {/* Download Excel Button */}
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFB800] to-[#FF6B35] text-black font-black text-xs hover:opacity-95 transition shadow-[0_0_15px_rgba(255,184,0,0.3)] active:scale-95"
                      >
                        {downloadSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-black" />
                            <span>Exported to XLSX!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-black" />
                            <span>Download Excel Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Donut Chart Box */}
                    <div className="p-5 rounded-xl bg-[#0D1017] border border-slate-800/80 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">Attendance Breakdown</h4>
                          <p className="text-[11px] text-slate-400">Total: {total} Students enrolled</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                          {(presentPct * 100).toFixed(0)}% Rate
                        </span>
                      </div>

                      <div className="flex items-center justify-around my-2">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r={radius} stroke="#1A1F2C" strokeWidth="22" fill="transparent" />
                            <circle
                              cx="80"
                              cy="80"
                              r={radius}
                              stroke="#22C55E"
                              strokeWidth="22"
                              fill="transparent"
                              strokeDasharray={`${presentStroke} ${circumference}`}
                              strokeLinecap="round"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r={radius}
                              stroke="#EF4444"
                              strokeWidth="22"
                              fill="transparent"
                              strokeDasharray={`${absentStroke} ${circumference}`}
                              strokeDashoffset={-presentStroke}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-white">{activeData.present}</span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Present</span>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
                            <span className="text-slate-300 font-semibold">Present:</span>
                            <span className="font-bold text-white">{activeData.present}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                            <span className="text-slate-300 font-semibold">Absent:</span>
                            <span className="font-bold text-white">{activeData.absent}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#FFB800]" />
                            <span className="text-slate-300 font-semibold">Late:</span>
                            <span className="font-bold text-white">{activeData.late}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                        <span>Class: {activeData.name}</span>
                        <span>Audited: Today</span>
                      </div>
                    </div>

                    {/* Area Trend Chart Box */}
                    <div className="p-5 rounded-xl bg-[#0D1017] border border-slate-800/80 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">4-Day Attendance Trend Curve</h4>
                          <p className="text-[11px] text-slate-400">Sep 6 - Sep 9 Attendance Progression</p>
                        </div>
                        <button
                          onClick={handleAiAnalyze}
                          className="px-2.5 py-1 rounded-lg bg-[#FFB800]/15 hover:bg-[#FFB800]/25 text-[#FFB800] text-[10px] font-black border border-[#FFB800]/40 flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3 h-3 text-[#FFB800]" />
                          <span>Analyze with AI</span>
                        </button>
                      </div>

                      {/* Sparkline Visual representation */}
                      <div className="h-36 flex items-end justify-between gap-3 px-2 pt-4">
                        {activeData.trend.map((pt) => {
                          const pHeight = (pt.present / 24) * 100;
                          const aHeight = (pt.absent / 24) * 100;
                          return (
                            <div key={pt.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                              <div className="w-full flex items-end gap-1 h-28">
                                <div
                                  style={{ height: `${Math.max(pHeight, 8)}%` }}
                                  className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm"
                                  title={`Present: ${pt.present}`}
                                />
                                <div
                                  style={{ height: `${Math.max(aHeight, 8)}%` }}
                                  className="w-1/2 bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm"
                                  title={`Absent: ${pt.absent}`}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{pt.day}</span>
                            </div>
                          );
                        })}
                      </div>

                      {showAiNotice && (
                        <div className="mt-2 p-2 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-[10px] flex items-center gap-1.5 animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800]" />
                          <span>AI Insight: No proxy or anomaly patterns detected. Attendance stability is 98.4%.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: DASHBOARD (Campus Overview) */}
              {/* ======================================================== */}
              {activeTab === 'Dashboard' && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Top Stats 4 Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      { label: 'Overall Campus Rate', value: '94.8%', icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, sub: '+2.4% vs last week' },
                      { label: 'Total Present Today', value: '452 / 476', icon: <Users className="w-4 h-4 text-[#FFB800]" />, sub: '24 Absentees queued' },
                      { label: 'AI Face Scans', value: '1,284', icon: <ScanFace className="w-4 h-4 text-[#FF6B35]" />, sub: '< 2.5s mean match' },
                      { label: 'Cloud DB Sync', value: '100%', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, sub: 'Supabase & SQLite ok' },
                    ].map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#0D1017] border border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>{c.label}</span>
                          {c.icon}
                        </div>
                        <div className="text-xl font-black text-white">{c.value}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{c.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Active Classrooms Live Status */}
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Live Classroom Attendance Streams</h4>
                        <p className="text-[11px] text-slate-400">Current ongoing sessions across all grades</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                        4 Sessions Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { cls: 'Class 9 - Section A', teacher: 'Himanshu Anand', students: '14/14 Marked', pct: 100, color: 'bg-emerald-500' },
                        { cls: 'Class 10 - Section B', teacher: 'Yash Anand', students: '20/24 Marked', pct: 83, color: 'bg-[#FFB800]' },
                        { cls: 'Class 8 - Section C', teacher: 'Priya Sharma', students: '18/18 Marked', pct: 100, color: 'bg-emerald-500' },
                      ].map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] font-black text-xs">
                              0{i + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{item.cls}</div>
                              <div className="text-[10px] text-slate-400">Teacher: {item.teacher}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono font-bold text-slate-300">{item.students}</span>
                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                              <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ATTENDANCE (Web Roll Call Interface) */}
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
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">Class 9 - Section A (Attendance Session)</h4>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          Web Camera Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click status pills or launch live webcam scanner to mark roll call.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsWebScanning(!isWebScanning)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FF6B35] text-white font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
                      >
                        <ScanFace className="w-3.5 h-3.5" />
                        <span>{isWebScanning ? 'Close Camera' : 'Live Web Camera Scan'}</span>
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-black border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan QR</span>
                      </button>
                    </div>
                  </div>

                  {isWebScanning && (
                    <div className="p-4 rounded-xl bg-black border-2 border-emerald-500/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="text-xs font-mono font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Webcam AI Recognition Active (1080p Stream)
                      </div>
                      <div className="relative w-52 h-32 border-2 border-[#FFB800] rounded-lg flex items-center justify-center">
                        <motion.div
                          animate={{ y: [-40, 40, -40] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#22C55E]"
                        />
                        <div className="absolute top-2 left-2 text-[9px] bg-black/80 px-1.5 py-0.5 rounded border border-emerald-400 text-emerald-300 font-mono">
                          ✓ Face Detected: Himanshu (99.4%)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Student Table */}
                  <div className="rounded-xl bg-[#0D1017] border border-slate-800 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800 grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase">
                      <span className="col-span-5">Student</span>
                      <span className="col-span-3 text-center">Roll No</span>
                      <span className="col-span-4 text-right">Attendance Action</span>
                    </div>

                    {[
                      { roll: '01', name: 'Himanshu Anand', id: '01' },
                      { roll: '02', name: 'Yash Anand', id: '02' },
                      { roll: '03', name: 'Ankit Kumar', id: '03' },
                      { roll: '04', name: 'Rohan Verma', id: '04' },
                    ].map((s) => {
                      const st = webAttStatus[s.id];
                      return (
                        <div key={s.id} className="px-4 py-2.5 border-b border-slate-800/80 grid grid-cols-12 items-center text-xs">
                          <div className="col-span-5 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#FFB800]/20 text-[#FFB800] font-black text-xs flex items-center justify-center">
                              {s.name[0]}
                            </div>
                            <span className="font-bold text-white">{s.name}</span>
                          </div>
                          <span className="col-span-3 text-center font-mono text-slate-400">{s.roll}</span>
                          <div className="col-span-4 flex justify-end gap-1.5">
                            <button
                              onClick={() => setWebAttStatus({ ...webAttStatus, [s.id]: 'present' })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                st === 'present'
                                  ? 'bg-emerald-500 text-black border-emerald-500 font-black'
                                  : 'bg-black text-slate-400 border-slate-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => setWebAttStatus({ ...webAttStatus, [s.id]: 'absent' })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                st === 'absent'
                                  ? 'bg-red-500 text-white border-red-500 font-black'
                                  : 'bg-black text-slate-400 border-slate-700'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: MEAL VERIFICATION */}
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
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Mid-Day Meal & Cafeteria Biometric Log</h4>
                      <p className="text-[11px] text-slate-400">Prevents meal token duplicates using instantaneous face match.</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#FFB800] text-black font-black text-xs">
                      Today: 382 Meals Served
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-black border border-slate-800 text-center">
                      <div className="text-lg font-black text-emerald-400">382</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Verified Taken</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black border border-slate-800 text-center">
                      <div className="text-lg font-black text-[#FFB800]">70</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Remaining</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black border border-slate-800 text-center">
                      <div className="text-lg font-black text-red-400">0</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Duplicate Attempts</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: STUDENT DIRECTORY */}
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
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Biometric Enrolled Student Directory</h4>
                      <p className="text-[11px] text-slate-400">Facial embedding vectors stored securely for offline verification.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                      100% Vector Indexed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Himanshu Anand', roll: '01', cls: 'Class 9 - Sec A', rate: '96.2%', status: 'Active Biometrics' },
                      { name: 'Yash Anand', roll: '02', cls: 'Class 9 - Sec A', rate: '94.0%', status: 'Active Biometrics' },
                      { name: 'Ankit Kumar', roll: '03', cls: 'Class 9 - Sec A', rate: '88.5%', status: 'Active Biometrics' },
                    ].map((s, i) => (
                      <div key={i} className="p-3 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#FF6B35] text-black font-extrabold text-xs flex items-center justify-center">
                            {s.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{s.name}</div>
                            <div className="text-[10px] text-slate-400">Roll {s.roll} • {s.cls}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-emerald-400">{s.rate} Attendance</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                            {s.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: TEACHER DIRECTORY */}
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
                  <div className="p-4 rounded-xl bg-[#0D1017] border border-slate-800">
                    <h4 className="text-sm font-bold text-white">Faculty & Authorized Proctor Directory</h4>
                    <p className="text-[11px] text-slate-400">Teachers permitted to initiate on-device mobile roll call sessions.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFB800] text-black font-extrabold text-xs flex items-center justify-center">
                        HA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Himanshu Anand</div>
                        <div className="text-[10px] text-slate-400">Head Teacher • Class 9-A & Class 10-B proctor</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Online & Authorized
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>AttendEase Cloud • Interactive Replica</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-mono">Synced to Campus Database</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
