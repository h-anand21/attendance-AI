'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw
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

export function DashboardReplica() {
  const [selectedClass, setSelectedClass] = useState<'class 9 - Section A' | 'class 10 - Section B'>('class 9 - Section A');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showAiNotice, setShowAiNotice] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeData = classDataMap[selectedClass];

  // Calculate donut circumference and stroke dashes
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

  return (
    <div className="w-full rounded-2xl bg-[#090B10] border-2 border-slate-800 shadow-2xl overflow-hidden text-slate-200 font-sans select-none relative">
      {/* Top simulated browser frame bar */}
      <div className="bg-[#06080C] px-4 py-2 border-b border-slate-800/90 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFB800] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#22C55E] inline-block" />
          <span className="ml-2 font-mono text-slate-400 hidden sm:inline text-[11px]">
            AttendEase Dashboard • Live Interactive Replica
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            INTERACTIVE CODE REPLICA
          </span>
        </div>
      </div>

      {/* Main Dashboard Layout (Sidebar + Content) */}
      <div className="flex min-h-[580px] bg-[#0A0C13]">
        {/* ======================================================== */}
        {/* SIDEBAR (Exact Replica of image.png) */}
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
              {[
                { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                { label: 'Attendance', icon: <CalendarCheck2 className="w-4 h-4" /> },
                { label: 'Meal Verification', icon: <Utensils className="w-4 h-4" /> },
                { label: 'Student Directory', icon: <Users className="w-4 h-4" /> },
                { label: 'Teacher Directory', icon: <UserCheck className="w-4 h-4" /> },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors text-xs font-semibold cursor-pointer"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}

              {/* Active Reports Tab - Yellow Indicator matching image.png */}
              <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-r-lg bg-slate-900/90 text-white text-xs font-bold border-l-4 border-[#FFB800] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <LineChart className="w-4 h-4 text-[#FFB800]" />
                <span>Reports</span>
              </div>
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
        {/* MAIN REPORTS CONTENT AREA */}
        {/* ======================================================== */}
        <main className="flex-1 p-5 md:p-7 flex flex-col justify-between overflow-x-hidden relative">
          {/* AI Scanning Visual Overlay */}
          <AnimatePresence>
            {isAiAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center"
              >
                <div className="p-6 rounded-2xl bg-[#111420] border-2 border-[#FFB800] shadow-[0_0_50px_rgba(255,184,0,0.3)] flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-[#FFB800] animate-spin mb-3" />
                  <span className="font-bold text-white text-sm">AI Anomaly Neural Scan In Progress...</span>
                  <span className="text-xs text-slate-400 mt-1">Analyzing cross-sectional absentee trends for {activeData.name}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Row: Title + Moon + Bell Icons */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Attendance Reports</h2>
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

          {/* Filter Reports Bar */}
          <div className="my-5 p-4 rounded-xl bg-[#0D1017] border border-slate-800/80">
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

              {/* Two Yellow Action Buttons (Matching image.png) */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAiAnalyze}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFB800] hover:bg-[#FFC700] text-black text-xs font-black transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:scale-105 active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-black" />
                  <span>Analyze with AI</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFB800] hover:bg-[#FFC700] text-black text-xs font-black transition-all shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:scale-105 active:scale-95"
                >
                  {downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-black" />
                      <span>Download Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Notice Badge if triggered */}
            {showAiNotice && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2.5 rounded-lg bg-[#FFB800]/15 border border-[#FFB800]/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-[#FFB800] font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Insight: Absentee spike detected on Sep 8 ({activeData.absent} students). Weather condition correlate.</span>
                </div>
                <button onClick={() => setShowAiNotice(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </motion.div>
            )}
          </div>

          {/* ======================================================== */}
          {/* TWO CHARTS ROW (Overall Status & Daily Trends) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
            {/* CARD 1: Overall Status (Donut Chart) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0D1017] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Overall Status</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Summary for the selected date range.. Total: {activeData.total}.
                </p>
              </div>

              {/* Animated Donut SVG */}
              <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#161B26"
                    strokeWidth="16"
                  />

                  {/* Red Absent Arc (12 out of 16) */}
                  <motion.circle
                    key={`absent-${selectedClass}`}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#DC2626"
                    strokeWidth="16"
                    strokeDasharray={`${absentStroke} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${absentStroke} ${circumference}` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />

                  {/* Green Present Arc (4 out of 16) */}
                  <motion.circle
                    key={`present-${selectedClass}`}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#20C997"
                    strokeWidth="16"
                    strokeDasharray={`${presentStroke} ${circumference}`}
                    strokeDashoffset={-absentStroke - 8}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${presentStroke} ${circumference}` }}
                    transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                  />
                </svg>

                {/* Center Pulse Ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{activeData.total}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total</span>
                </div>
              </div>

              {/* Legend matching image.png */}
              <div className="flex items-center justify-center gap-5 text-xs pt-2 border-t border-slate-800/60 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] inline-block" />
                  <span className="text-slate-300">Present ({activeData.present})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
                  <span className="text-slate-300">Absent ({activeData.absent})</span>
                </div>
              </div>
            </div>

            {/* CARD 2: Daily Trends (Smooth Wave Multi-Area Chart) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0D1017] border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Trends</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Attendance summary for each day in the selected range.
                </p>
              </div>

              {/* Area Chart SVG Replica */}
              <div className="relative w-full h-48 my-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    {/* Absent Red Gradient */}
                    <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0.05" />
                    </linearGradient>

                    {/* Present Green/Teal Gradient */}
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#20C997" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#20C997" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  {[0, 40, 80, 120].map((yVal, i) => (
                    <line
                      key={i}
                      x1="30"
                      y1={yVal}
                      x2="480"
                      y2={yVal}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Y-Axis Labels */}
                  <text x="15" y="15" fill="#64748B" fontSize="9" fontFamily="monospace">4</text>
                  <text x="15" y="55" fill="#64748B" fontSize="9" fontFamily="monospace">3</text>
                  <text x="15" y="95" fill="#64748B" fontSize="9" fontFamily="monospace">2</text>
                  <text x="15" y="135" fill="#64748B" fontSize="9" fontFamily="monospace">1</text>
                  <text x="15" y="155" fill="#64748B" fontSize="9" fontFamily="monospace">0</text>

                  {/* Absent Wave Curve (Red) */}
                  <motion.path
                    key={`absent-wave-${selectedClass}`}
                    d="M 30,100 C 130,80 230,40 350,20 C 420,10 450,45 480,75 L 480,155 L 30,155 Z"
                    fill="url(#absentGradient)"
                    stroke="#DC2626"
                    strokeWidth="2.5"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />

                  {/* Present Wave Curve (Green) */}
                  <motion.path
                    key={`present-wave-${selectedClass}`}
                    d="M 30,155 C 120,130 180,120 280,120 C 380,120 430,110 480,95 L 480,155 L 30,155 Z"
                    fill="url(#presentGradient)"
                    stroke="#20C997"
                    strokeWidth="2.5"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.2, ease: 'easeInOut' }}
                  />

                  {/* Late Flat Line (Yellow) along bottom */}
                  <line
                    x1="30"
                    y1="154"
                    x2="480"
                    y2="154"
                    stroke="#FFB800"
                    strokeWidth="2"
                  />
                </svg>

                {/* X-Axis Day Labels matching image.png */}
                <div className="flex justify-between px-7 pt-2 text-[10px] text-slate-400 font-mono">
                  <span>Sep 6</span>
                  <span>Sep 7</span>
                  <span>Sep 8</span>
                  <span>Sep 9</span>
                </div>
              </div>

              {/* Legend at bottom matching image.png */}
              <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t border-slate-800/60 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#20C997] inline-block" />
                  <span className="text-slate-300">present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
                  <span className="text-slate-300">absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] inline-block" />
                  <span className="text-slate-300">late</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
