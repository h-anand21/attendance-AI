'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import MarketingLayout from './(marketing)/layout';
import {
  ScanFace,
  QrCode,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Check,
  Cpu,
  Eye,
  RefreshCw,
  Camera,
  Flame,
  CheckSquare
} from 'lucide-react';
import {
  LiquidSheenText,
  Magnetic,
  Reveal,
  MoActionBadge
} from 'motion-organic/react';
import { DashboardReplica } from '@/components/dashboard-replica';
import { MobileAttendanceSimulator } from '@/components/mobile-attendance-simulator';
import { WebAttendanceSimulator } from '@/components/web-attendance-simulator';

// Exact color constants from mobile/src/theme/index.ts
// yellow: '#FFB800', orange: '#FF6B35', success: '#22C55E', error: '#EF4444', black: '#000000', white: '#FFFFFF'

const mobileSteps = [
  {
    step: '01',
    badge: 'Step 1 • Class Selection',
    title: 'Select Class & View Daily Schedule',
    subtitle: 'Teacher opens the mobile app and selects the designated classroom with one tap.',
    description:
      'Instantly displays today’s date, active classes (Class 9 - Section A, Class 10 - Section B), and real-time enrolled student count so teachers can begin roll call in seconds.',
    image: '/Screenshot_20260929_001625.jpg.jpeg',
    tag: 'Quick Launch',
    themeColor: '#FFB800', // Yellow
    accentGradient: 'from-[#FFB800] to-[#FFA000]',
    features: [
      'Automatic Date & Class Schedule Sync',
      'One-tap Classroom Selector',
      'Total Enrolled Roster Preview'
    ]
  },
  {
    step: '02',
    badge: 'Step 2 • Multi-Modal Modes',
    title: 'Choose Mode: Face Scan, Photo or QR',
    subtitle: 'Choose between Live AI Face Scan, Group Photo Upload, or Student QR Code scanning.',
    description:
      'The class dashboard provides live counters for Present, Absent, and Late students, alongside individual student status cards and quick action triggers.',
    image: '/Screenshot_20260929_001651.jpg.jpeg',
    tag: '3 Ways to Check In',
    themeColor: '#FF6B35', // Orange
    accentGradient: 'from-[#FF6B35] to-[#E55A2B]',
    features: [
      'Live Face Scan Session trigger',
      'Single/Group Classroom Photo Upload',
      'Real-Time Present / Absent / Late counter'
    ]
  },
  {
    step: '03',
    badge: 'Step 3 • Live AI Camera',
    title: '1080p Viewfinder with AI Face Recognition',
    subtitle: 'Align student faces within the smart viewfinder for instant recognition.',
    description:
      'Runs optimized on-device face detection paired with high-precision AI models. Detects and matches student facial biometric vectors in under 2.5 seconds with anti-spoofing defense.',
    image: '/Screenshot_20260929_001808.jpg.jpeg',
    tag: 'Sub-2.5s Scan',
    themeColor: '#FFB800', // Yellow/Amber
    accentGradient: 'from-[#FFB800] to-[#FF6B35]',
    features: [
      'Sharp 1080p Camera Viewfinder overlay',
      'Fast biometric face bounding & tracking',
      'Anti-spoofing photo & replay prevention'
    ]
  },
  {
    step: '04',
    badge: 'Step 4 • Instant Verification',
    title: 'Auto-Marked & Synced to Cloud Dashboard',
    subtitle: 'Recognized students turn green [P] instantly, ready for one-tap confirmation.',
    description:
      'Students like Himanshu Anand and Yash Anand are automatically verified and marked Present. Tap "Confirm Attendance" to sync records with the central web database in real time.',
    image: '/Screenshot_20260929_002020.jpg.jpeg',
    tag: 'Instant Sync',
    themeColor: '#22C55E', // Green Present
    accentGradient: 'from-[#22C55E] to-[#16A34A]',
    features: [
      'Color-coded student status chips [P / A / L]',
      '1-Tap Confirm Attendance submission',
      'Instant cloud synchronization with Web Portal'
    ]
  }
];

const coreFeatures = [
  {
    icon: <ScanFace className="w-7 h-7 text-[#FFB800]" />,
    title: '1080p AI Face Recognition',
    description:
      'Continuous real-time face scan mode and group photo recognition designed specifically for noisy classroom lighting conditions.',
    accentBorder: 'hover:border-[#FFB800]/60',
    glowColor: 'bg-[#FFB800]/10',
    badge: 'AI Core'
  },
  {
    icon: <Smartphone className="w-7 h-7 text-[#FF6B35]" />,
    title: 'Native Android Mobile App',
    description:
      'Equip teachers with a standalone high-speed Android APK capable of taking roll calls in seconds without requiring laptop setups.',
    accentBorder: 'hover:border-[#FF6B35]/60',
    glowColor: 'bg-[#FF6B35]/10',
    badge: 'Android APK'
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-[#FFB800]" />,
    title: 'Web Analytics & Reports',
    description:
      'Full visual analytics with daily attendance trends, absent/present ratios, anomaly alerts, and one-click Excel report exports.',
    accentBorder: 'hover:border-[#FFB800]/60',
    glowColor: 'bg-[#FFB800]/10',
    badge: 'Dashboard'
  },
  {
    icon: <QrCode className="w-7 h-7 text-[#FF6B35]" />,
    title: 'QR Code & ID Badges',
    description:
      'Every student receives a unique QR code for swift contact-free kiosk scans during morning assembly or library check-ins.',
    accentBorder: 'hover:border-[#FF6B35]/60',
    glowColor: 'bg-[#FF6B35]/10',
    badge: 'Fast Kiosk'
  },
  {
    icon: <Cpu className="w-7 h-7 text-[#FFB800]" />,
    title: 'AI Anomaly Detection',
    description:
      'Intelligent pattern analysis spots chronic absenteeism, proxy attempts, and attendance drop-offs before they impact grades.',
    accentBorder: 'hover:border-[#FFB800]/60',
    glowColor: 'bg-[#FFB800]/10',
    badge: 'Intelligence'
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-[#22C55E]" />,
    title: 'Enterprise Security & Sync',
    description:
      'End-to-end encrypted biometric embeddings, zero raw face storage leaks, role-based controls, and seamless cloud database syncing.',
    accentBorder: 'hover:border-[#22C55E]/60',
    glowColor: 'bg-[#22C55E]/10',
    badge: 'Secure'
  }
];

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mobileViewMode, setMobileViewMode] = useState<'interactive' | 'screenshot'>('interactive');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'web'>('mobile');

  // Auto-cycle through mobile steps every 5 seconds unless hovered/interacted
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % mobileSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <MarketingLayout>
      <div className="flex flex-col min-h-screen bg-[#0B0F19] text-[#F1F5F9] overflow-x-hidden selection:bg-amber-400 selection:text-black">
        {/* Modern subtle ambient lighting - deep midnight slate with faint amber & indigo depth */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-indigo-600/[0.07] rounded-full blur-[160px]" />
          <div className="absolute top-[30%] -left-36 w-[550px] h-[550px] bg-amber-500/[0.04] rounded-full blur-[170px]" />
          <div className="absolute top-[60%] -right-36 w-[600px] h-[600px] bg-blue-600/[0.05] rounded-full blur-[180px]" />
          <div className="absolute bottom-10 left-1/3 w-[600px] h-[450px] bg-slate-700/[0.08] rounded-full blur-[170px]" />
          {/* Subtle modern grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,#000_70%,transparent_100%)] opacity-30" />
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION (Text on Left, Mobile & Web Attendance Animation on Right) */}
        {/* ========================================================================= */}
        <section className="relative z-10 pt-4 pb-6 md:pt-6 md:pb-8 lg:min-h-[calc(100vh-4.5rem)] lg:flex lg:items-center border-b border-slate-800/60">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column: Headline, Descriptions, CTAs, and Stats */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Architectural Product Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-4 inline-block"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium tracking-wide text-slate-200 shadow-sm backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-bold text-white">On-Device AI</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">Zero Hardware Required</span>
                  </div>
                </motion.div>

                {/* Main Headline - Crafted Typography */}
                <div className="space-y-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="text-4xl sm:text-5xl lg:text-[3.85rem] font-extrabold tracking-[-0.035em] text-white leading-[1.08]"
                  >
                    Instant Multi-Face Attendance.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold tracking-[-0.02em] leading-snug"
                  >
                    <span className="text-slate-200">Built for speed. </span>
                    <span className="text-amber-400">Ready in seconds. </span>
                    <span className="text-slate-400">Zero internet needed.</span>
                  </motion.p>
                </div>

                {/* Subtitle - Editorial Callout with Left Accent */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className="mt-6 max-w-xl border-l-2 border-amber-400/60 pl-4 py-1"
                >
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    Replace slow roll calls and expensive biometric machines with a high-speed Android app. Detect and verify multiple faces simultaneously in <strong className="text-white font-semibold">under 2.5 seconds</strong> with <strong className="text-white font-semibold">99.8% precision</strong>, backed by seamless cloud analytics.
                  </p>
                </motion.div>

                {/* CTA Buttons - Large & Tactile */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                  className="mt-7 flex flex-wrap items-center gap-4"
                >
                  {/* Direct APK Download Button */}
                  <Magnetic strength={0.35} radius={100} className="inline-block">
                    <a
                      href="/AttendEase-Release.apk"
                      download="AttendEase-v1.0.1.apk"
                      className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wide shadow-[0_4px_20px_rgba(245,158,11,0.22)] border border-amber-300/60 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      <Download className="w-4 h-4 text-slate-950 stroke-[2.5] group-hover:translate-y-0.5 transition-transform duration-200" />
                      <div className="text-left">
                        <div className="leading-tight font-black text-sm">Download Android APK</div>
                        <div className="text-[10px] text-slate-900/80 font-bold lowercase">direct install • 136 mb • v1.0.1</div>
                      </div>
                    </a>
                  </Magnetic>

                  {/* Open Web Dashboard Button */}
                  <Magnetic strength={0.25} radius={90} className="inline-block">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 transition-all duration-200 backdrop-blur-md shadow-sm hover:-translate-y-0.5"
                    >
                      <Laptop className="w-4 h-4 text-slate-300" />
                      <span>Open Web Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Magnetic>
                </motion.div>

                {/* Editorial Micro-Proof Row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-7 pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-4 w-full max-w-xl"
                >
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Face Scan Speed</div>
                    <div className="text-base font-extrabold text-white tracking-tight mt-0.5">&lt; 2.5s Total</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">AI Accuracy</div>
                    <div className="text-base font-extrabold text-amber-400 tracking-tight mt-0.5">99.8% Match</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Classroom Mode</div>
                    <div className="text-base font-extrabold text-emerald-400 tracking-tight mt-0.5">100% Offline</div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Live Mobile & Web Attendance Animation Switcher */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                {/* Switcher Bar: Mobile vs Web */}
                <div className="mb-2.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 shadow-lg backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setDeviceMode('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      deviceMode === 'mobile'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Android Mobile App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeviceMode('web')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      deviceMode === 'web'
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Web Cloud Portal</span>
                  </button>
                </div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative group w-full flex justify-center items-center min-h-[460px]"
                >
                  {/* Glowing backlight behind device - subtle indigo/amber depth */}
                  <div className="absolute -inset-5 bg-gradient-to-r from-blue-600/10 via-amber-500/10 to-indigo-600/10 rounded-[3rem] blur-2xl opacity-60 pointer-events-none" />

                  <AnimatePresence mode="wait">
                    {deviceMode === 'mobile' ? (
                      /* Mobile Phone Frame */
                      <motion.div
                        key="device-mobile"
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-[280px] sm:w-[305px] md:w-[320px] rounded-[2.6rem] p-2.5 bg-gradient-to-b from-slate-700 via-slate-900 to-black border-[3.5px] border-slate-950 shadow-2xl"
                      >
                        {/* Notch / Speaker */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-3.5 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-2" />
                          <div className="w-9 h-1 rounded-full bg-slate-800" />
                        </div>

                        {/* Phone Screen: Live Interactive Attendance Taking Flow */}
                        <div className="relative w-full aspect-[9/18.2] max-h-[520px] rounded-[2.1rem] overflow-hidden bg-white border border-slate-700 shadow-inner">
                          <MobileAttendanceSimulator autoPlay={true} />
                        </div>

                        {/* Bottom home indicator bar */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-26 h-1 rounded-full bg-slate-600/70 pointer-events-none" />
                      </motion.div>
                    ) : (
                      /* Web Laptop / Browser Frame */
                      <motion.div
                        key="device-web"
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-[430px] sm:max-w-[470px] rounded-2xl p-2.5 bg-gradient-to-b from-slate-700 via-slate-900 to-black border-[3.5px] border-slate-950 shadow-2xl"
                      >
                        <div className="relative w-full h-[380px] sm:h-[420px] rounded-xl overflow-hidden bg-[#0A0C13] border border-slate-800 shadow-inner">
                          <WebAttendanceSimulator autoPlay={true} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>
                    {deviceMode === 'mobile'
                      ? 'Live on-device Android attendance simulation'
                      : 'Live Web portal browser webcam attendance simulation'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: WEB DASHBOARD SHOWCASE (Using user's public/image.png) */}
        {/* ========================================================================= */}
        <section id="web-analytics" className="relative z-10 py-20 lg:py-28 scroll-mt-20 border-b border-slate-800/80 bg-gradient-to-b from-transparent via-[#0B0F19]/60 to-transparent">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] text-xs font-bold uppercase tracking-wider mb-4">
                <Laptop className="w-3.5 h-3.5" />
                Administrative Web Portal
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Attendance Intelligence & Visual Analytics
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                Track campus-wide attendance in real time. Gain instant insights into daily trends, student ratios,
                and export audit-ready Excel reports with a single click.
              </p>
            </div>

            {/* Interactive React Code Replica of Attendance Reports Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="relative max-w-6xl mx-auto group"
            >
              {/* Refined subtle ambient aura */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition duration-700 pointer-events-none" />

              {/* The Live Interactive React Code Replica */}
              <DashboardReplica />
            </motion.div>

            {/* Feature Highlights Grid Below Dashboard with motion hover */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-[#11131A] border-2 border-slate-800 hover:border-[#FFB800]/60 transition-colors shadow-[3px_3px_0px_#000000]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFB800]/15 border-2 border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Daily Trends & Visual Curves</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Interactive multi-gradient area charts that map present, absent, and late student trends across any
                  selected date range.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-[#11131A] border-2 border-slate-800 hover:border-[#FF6B35]/60 transition-colors shadow-[3px_3px_0px_#000000]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 border-2 border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">One-Click Excel Reports</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Generate formatted, audit-compliant spreadsheets for school boards and parents with all student
                  timestamps and attendance percentages.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-[#11131A] border-2 border-slate-800 hover:border-[#FFB800]/60 transition-colors shadow-[3px_3px_0px_#000000]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFB800]/15 border-2 border-[#FFB800]/30 flex items-center justify-center text-[#FFB800] mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Instant AI Anomaly Analysis</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Click &quot;Analyze with AI&quot; to detect suspicious absentee clusters, proxy check-in spikes, and student
                  dropout risk factors automatically.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: MOBILE APP 4-STEP INTERACTIVE WALKTHROUGH */}
        {/* ========================================================================= */}
        <section id="mobile-app" className="relative z-10 py-20 lg:py-28 border-b border-slate-800/80">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/15 border-2 border-[#FF6B35]/40 text-[#FF6B35] text-xs font-black uppercase tracking-wider mb-4">
                <Smartphone className="w-3.5 h-3.5" />
                Native Android App Walkthrough
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                How Teachers Take Attendance in 4 Steps
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                Experience the real flow of the AttendEase Android App. Click each step to explore how rapid AI
                recognition turns a 15-minute roll call into a 10-second breeze.
              </p>
            </div>

            {/* Step Selection Tabs with animated progress bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto mb-12">
              {mobileSteps.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <motion.button
                    key={s.step}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveStep(idx);
                      setIsAutoPlaying(false);
                    }}
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-300 border-2 overflow-hidden ${
                      isActive
                        ? 'bg-[#151821] border-[#FFB800] shadow-[0_0_25px_rgba(255,184,0,0.3)] -translate-y-1'
                        : 'bg-[#0E1016] border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    {/* Animated Progress Bar for Active Step */}
                    {isActive && isAutoPlaying && (
                      <motion.div
                        key={`progress-${activeStep}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1 bg-[#FFB800]"
                      />
                    )}

                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-[#FFB800] text-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        STEP {s.step}
                      </span>
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] animate-pulse" />
                      )}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {s.tag}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Interactive Showcase Box */}
            <div className="max-w-6xl mx-auto rounded-3xl bg-[#0D0F15] border-2 border-slate-800 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Phone Mockup with Original 4-Step App Screenshots */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative group"
                  >
                    {/* Glowing backlight behind phone in current step color */}
                    <div
                      style={{
                        background: `radial-gradient(circle, ${mobileSteps[activeStep].themeColor}40 0%, transparent 70%)`
                      }}
                      className="absolute -inset-6 rounded-[3rem] blur-2xl opacity-60 transition-all duration-700 pointer-events-none"
                    />

                    {/* Phone Frame */}
                    <div className="relative w-[285px] sm:w-[315px] rounded-[2.8rem] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-black border-4 border-black shadow-2xl">
                      {/* Notch / Speaker */}
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                        <div className="w-10 h-1 rounded-full bg-slate-800" />
                      </div>

                      {/* Screen content displaying original screenshots */}
                      <div className="relative w-full aspect-[9/19.5] rounded-[2.2rem] overflow-hidden bg-black border-2 border-slate-800 shadow-inner">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="w-full h-full relative"
                          >
                            <Image
                              src={mobileSteps[activeStep].image}
                              alt={mobileSteps[activeStep].title}
                              fill
                              className="object-cover object-center"
                              priority
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Bottom home indicator bar */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-slate-600/70 pointer-events-none" />
                    </div>
                  </motion.div>

                  <div className="mt-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Native Android App • Screen {mobileSteps[activeStep].step}</span>
                  </div>
                </div>

                {/* Right: Step Details AND Live Animated Attendance Experience */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35 }}
                    >
                      {/* Step Badge */}
                      <div
                        style={{
                          backgroundColor: `${mobileSteps[activeStep].themeColor}20`,
                          borderColor: `${mobileSteps[activeStep].themeColor}60`,
                          color: mobileSteps[activeStep].themeColor
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 text-xs font-black uppercase tracking-wider mb-3"
                      >
                        <span
                          style={{ backgroundColor: mobileSteps[activeStep].themeColor }}
                          className="w-2 h-2 rounded-full"
                        />
                        {mobileSteps[activeStep].badge}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                        {mobileSteps[activeStep].title}
                      </h3>

                      <p
                        style={{ color: mobileSteps[activeStep].themeColor }}
                        className="font-bold text-sm sm:text-base mb-4"
                      >
                        {mobileSteps[activeStep].subtitle}
                      </p>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                        {mobileSteps[activeStep].description}
                      </p>

                      {/* Feature Bullet points */}
                      <div className="space-y-3 mb-8">
                        {mobileSteps[activeStep].features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div
                              style={{
                                backgroundColor: `${mobileSteps[activeStep].themeColor}25`,
                                color: mobileSteps[activeStep].themeColor
                              }}
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <span className="text-slate-200 text-sm font-semibold">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Navigation buttons & direct APK link */}
                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStep((prev) => (prev + 1) % mobileSteps.length);
                            setIsAutoPlaying(false);
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-colors"
                        >
                          <span>Next Step</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <a
                          href="/AttendEase-Release.apk"
                          download="AttendEase-v1.0.1.apk"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#FFC700] text-black text-sm font-black uppercase tracking-wider transition-all border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#FF6B35]"
                        >
                          <Download className="w-4 h-4 text-black" />
                          <span>Download APK to Test</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                          className="text-xs text-slate-500 hover:text-slate-300 ml-auto transition-colors font-medium"
                        >
                          {isAutoPlaying ? '⏸ Pause Slideshow' : '▶ Play Slideshow'}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ENTERPRISE CAPABILITIES & ARCHITECTURE */}
        {/* ========================================================================= */}
        <section id="features" className="relative z-10 py-20 lg:py-28 border-b border-slate-800/80">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B35]/15 border-2 border-[#FF6B35]/40 text-[#FF6B35] text-xs font-black uppercase tracking-wider mb-4">
                <Layers className="w-3.5 h-3.5" />
                Comprehensive Technology
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Engineered for High-Density Classrooms
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                Whether managing 30 students or 3,000 across multiple campus wings, AttendEase gives educators the
                fastest, most reliable tools in education technology.
              </p>
            </div>

            {/* Grid of 6 Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {coreFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={`p-8 rounded-3xl bg-[#0F1118] border-2 border-slate-800 ${f.accentBorder} transition-all duration-300 relative group overflow-hidden shadow-[3px_3px_0px_#000000]`}
                >
                  <div
                    className={`absolute top-0 right-0 w-36 h-36 ${f.glowColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                  />
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex p-3 rounded-2xl bg-black border-2 border-slate-800">
                      {f.icon}
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: FINAL HIGH-CONVERTING CTA */}
        {/* ========================================================================= */}
        <section className="relative z-10 py-20 lg:py-28">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center rounded-3xl bg-gradient-to-b from-[#13161F] to-[#0A0C11] border-2 border-[#FFB800]/50 p-10 sm:p-16 relative overflow-hidden shadow-2xl backdrop-blur-xl"
            >
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-[130px] pointer-events-none" />

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Ready to Upgrade Your Campus Attendance?
              </h2>
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of forward-thinking educators saving 45+ minutes every day. Download the Android app
                or explore the live cloud dashboard now.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
                <Magnetic strength={0.35} radius={100} className="w-full sm:w-auto inline-block">
                  <a
                    href="/AttendEase-Release.apk"
                    download="AttendEase-v1.0.1.apk"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_6px_25px_rgba(245,158,11,0.25)] border border-amber-300/40 transition-all hover:-translate-y-0.5 active:translate-y-1"
                  >
                    <Download className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <span>Download Free Android APK</span>
                  </a>
                </Magnetic>

                <Magnetic strength={0.25} radius={90} className="w-full sm:w-auto inline-block">
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-base transition-all hover:-translate-y-0.5 shadow-sm"
                  >
                    <span>Access Web Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </Magnetic>
              </div>

              {/* Instant 1-Click Direct Install & Direct Mirror Link */}
              <div className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center justify-center gap-2 mb-8">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>Instant 1-Click Direct Install (136 MB) • No Login Required</span>
                <span className="text-slate-600">•</span>
                <a href="/api/download-apk" className="text-amber-400 hover:underline font-bold">
                  Direct Mirror Link
                </a>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto pt-6 border-t border-slate-800/80">
                {[
                  { value: '< 2.5s', label: 'Face Scan Speed', icon: <Zap className="w-4 h-4 text-amber-400" /> },
                  { value: '99.8%', label: 'AI Accuracy', icon: <Sparkles className="w-4 h-4 text-blue-400" /> },
                  { value: '1080p', label: 'Full HD Multi-Face', icon: <Eye className="w-4 h-4 text-indigo-400" /> },
                  { value: '100%', label: 'Offline Ready', icon: <RefreshCw className="w-4 h-4 text-emerald-400" /> },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mb-1">
                      {stat.icon}
                      <span className="font-bold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}