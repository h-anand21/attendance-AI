'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanFace,
  QrCode,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Camera,
  Calendar,
  ArrowRight,
  RefreshCw,
  Home,
  BarChart2,
  User,
  Sparkles
} from 'lucide-react';

interface MobileAttendanceSimulatorProps {
  currentStep?: number;
  onStepChange?: (step: number) => void;
  autoPlay?: boolean;
}

export function MobileAttendanceSimulator({
  currentStep = 0,
  onStepChange,
  autoPlay = true,
}: MobileAttendanceSimulatorProps) {
  const [internalStep, setInternalStep] = useState(currentStep);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Sync with parent currentStep if changed externally
  useEffect(() => {
    if (!userInteracted && currentStep !== undefined) {
      setInternalStep(currentStep);
    }
  }, [currentStep, userInteracted]);

  // Handle step updates & scan simulation
  useEffect(() => {
    if (internalStep === 2) {
      // Step 2 is Face scan mode
      setIsScanning(true);
      const timer1 = setTimeout(() => setDetectedCount(1), 500);
      const timer2 = setTimeout(() => setDetectedCount(2), 1000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setIsScanning(false);
      setDetectedCount(internalStep === 3 ? 2 : 0);
    }
  }, [internalStep]);

  // Auto-cycle through the 4 steps every 4.5 seconds if autoPlay is enabled
  useEffect(() => {
    if (!autoPlay || userInteracted) return;
    const interval = setInterval(() => {
      setInternalStep((prev) => {
        const next = (prev + 1) % 4;
        onStepChange?.(next);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, userInteracted, onStepChange]);

  const handleNext = (nextIdx: number) => {
    setUserInteracted(true);
    setInternalStep(nextIdx);
    onStepChange?.(nextIdx);
  };

  return (
    <div className="w-full h-full bg-[#FFFFFF] text-black flex flex-col justify-between overflow-hidden relative select-none font-sans">
      {/* Top Mobile Status Bar (Authentic Android Bar - Zoomed & Crisp) */}
      <div className="px-4 pt-2.5 pb-1.5 flex items-center justify-between text-xs font-mono text-black font-extrabold border-b border-black/10 bg-white z-20">
        <span className="tracking-tight">12:16</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-black">5G</span>
          <span className="font-bold">100%</span>
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence initial={false}>
          {/* ========================================================== */}
          {/* SCREEN 1: mobile/app/(tabs)/attendance.tsx */}
          {/* ========================================================== */}
          {internalStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-3.5 flex flex-col justify-between overflow-y-auto bg-white"
            >
              <div>
                {/* Header matching mobile attendance.tsx */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-tight text-black">
                      TAKE<br />ATTENDANCE
                    </h2>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">Select a class to begin</p>
                  </div>
                  {/* Decorative dot matrix like BrutalDecorations */}
                  <div className="grid grid-cols-3 gap-1 opacity-70 pt-1">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-black rounded-full" />
                    ))}
                  </div>
                </div>

                {/* TODAY'S DATE BrutalCard variant="yellow" */}
                <div className="p-2.5 rounded-xl bg-[#FFB800] border-2 border-black shadow-[2.5px_2.5px_0px_#000000] mb-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[9px] font-black uppercase tracking-wider text-black/75">TODAY&apos;S DATE</div>
                    <div className="text-xs font-black text-black">TUESDAY, 29 SEP 2026</div>
                  </div>
                </div>

                {/* Class Cards matching mobile */}
                <div className="space-y-2">
                  {/* Class 10 */}
                  <div className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FFB800] border-2 border-black font-black text-xs flex items-center justify-center">
                        01
                      </div>
                      <div>
                        <div className="text-xs font-black text-black">class 10</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-black/40">SEC B</span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">3 STUDENTS</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </div>

                  {/* Class 9 (Target) */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleNext(1)}
                    className="p-2.5 rounded-xl bg-[#FFFBEB] border-2 border-black shadow-[3px_3px_0px_#FF6B35] flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FF6B35] border-2 border-black font-black text-xs text-white flex items-center justify-center">
                        02
                      </div>
                      <div>
                        <div className="text-xs font-black text-black flex items-center gap-1.5">
                          <span>Class 9</span>
                          <span className="text-[8px] bg-[#FFB800] text-black px-1.5 py-0.2 rounded font-black border border-black">TAP</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-black/40">SEC A</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">14 STUDENTS</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFB800]" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom Quick Select CTA */}
              <button
                type="button"
                onClick={() => handleNext(1)}
                className="w-full mt-2.5 py-2 rounded-xl bg-[#FFB800] text-black font-black text-xs uppercase border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center gap-1.5 hover:bg-[#FFC700]"
              >
                <span>Open Class 9 Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 2: mobile/app/attendance/[classId].tsx */}
          {/* ========================================================== */}
          {internalStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-3.5 flex flex-col justify-between overflow-y-auto bg-white"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">TAKE ATTENDANCE</span>
                    <h3 className="text-sm font-black text-black">CLASS 9 - SECTION A</h3>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black text-white font-bold">14 Students</span>
                </div>

                {/* 3 Action Buttons matching mobile [classId].tsx: SCAN QR, FACE SCAN, UPLOAD */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleNext(2)}
                    className="p-2 rounded-xl bg-[#FFB800] border-2 border-black shadow-[2px_2px_0px_#000000] text-center flex flex-col items-center justify-center"
                  >
                    <QrCode className="w-4 h-4 text-black" />
                    <span className="text-[9px] font-black mt-1 text-black">SCAN QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNext(2)}
                    className="p-2 rounded-xl bg-[#FF6B35] border-2 border-black shadow-[2px_2px_0px_#000000] text-center flex flex-col items-center justify-center animate-pulse"
                  >
                    <ScanFace className="w-4 h-4 text-white stroke-[2.5]" />
                    <span className="text-[9px] font-black mt-1 text-white">FACE SCAN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNext(2)}
                    className="p-2 rounded-xl bg-black border-2 border-black shadow-[2px_2px_0px_#000000] text-center flex flex-col items-center justify-center"
                  >
                    <ImageIcon className="w-4 h-4 text-[#FFB800]" />
                    <span className="text-[9px] font-black mt-1 text-white">UPLOAD</span>
                  </button>
                </div>

                {/* 3 Summary Cards matching mobile [classId].tsx: PRESENT, ABSENT, LATE */}
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div className="p-2 rounded-xl bg-[#DCFCE7] border-2 border-black text-center">
                    <div className="text-base font-black text-[#16A34A] leading-tight">0</div>
                    <div className="text-[9px] font-black text-black">PRESENT</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEE2E2] border-2 border-black text-center">
                    <div className="text-base font-black text-[#DC2626] leading-tight">3</div>
                    <div className="text-[9px] font-black text-black">ABSENT</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEF3C7] border-2 border-black text-center">
                    <div className="text-base font-black text-[#92400E] leading-tight">0</div>
                    <div className="text-[9px] font-black text-black">LATE</div>
                  </div>
                </div>

                {/* Student Roster Sample */}
                <div className="space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">STUDENTS (PENDING)</div>
                  {['Himanshu Anand', 'Yash Anand'].map((name) => (
                    <div key={name} className="p-2 rounded-xl bg-white border border-black/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 border border-black/40 text-[9px] font-black flex items-center justify-center">
                          {name[0]}
                        </div>
                        <span className="font-bold text-black">{name}</span>
                      </div>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                        ABSENT
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action: Launch Face Camera */}
              <button
                type="button"
                onClick={() => handleNext(2)}
                className="w-full mt-2.5 py-2 rounded-xl bg-[#FF6B35] text-white font-black text-xs uppercase border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center gap-1.5"
              >
                <ScanFace className="w-4 h-4 text-white" />
                <span>Launch Live AI Camera</span>
              </button>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 3: 1080P AI CAMERA VIEWFINDER */}
          {/* ========================================================== */}
          {internalStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-3.5 flex flex-col justify-between bg-black text-white relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between text-[10px] relative z-10">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  REC 1080p
                </span>
                <span className="text-emerald-400 font-bold font-mono">Gemini AI Engine</span>
              </div>

              {/* Viewfinder Center Box */}
              <div className="relative w-44 h-44 mx-auto my-auto flex items-center justify-center">
                {/* 4 Brackets */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#FFB800]" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#FFB800]" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#FFB800]" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#FFB800]" />

                {/* Moving Green Laser */}
                <motion.div
                  animate={{ y: [-50, 50, -50] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_12px_#22C55E]"
                />

                {/* Face Badges */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  {detectedCount >= 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2.5 py-1 rounded bg-black/90 border border-emerald-400 text-emerald-400 text-[9px] font-bold shadow flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Himanshu Anand (99.4%)</span>
                    </motion.div>
                  )}
                  {detectedCount >= 2 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2.5 py-1 rounded bg-black/90 border border-emerald-400 text-emerald-400 text-[9px] font-bold shadow flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Yash Anand (98.8%)</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Shutter trigger */}
              <div className="relative z-10 text-center">
                <div className="text-[10px] font-bold text-slate-300 mb-2">
                  {detectedCount === 2 ? '🎉 2 Students Matched!' : 'Scanning multi-faces...'}
                </div>
                <button
                  type="button"
                  onClick={() => handleNext(3)}
                  className="w-full py-2 rounded-xl bg-[#22C55E] text-black font-black text-xs uppercase border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center gap-1.5 hover:bg-emerald-400"
                >
                  <Camera className="w-3.5 h-3.5 text-black" />
                  <span>Mark Recognized (2/3)</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 4: ATTENDANCE CONFIRMED & SAVED */}
          {/* ========================================================== */}
          {internalStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 p-3.5 flex flex-col justify-between overflow-y-auto bg-white"
            >
              <div>
                {/* Success Banner */}
                <div className="p-2.5 rounded-xl bg-[#DCFCE7] border-2 border-[#16A34A] text-black mb-2.5">
                  <div className="flex items-center gap-1.5 font-black text-xs text-[#16A34A]">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>AI RECOGNITION COMPLETE!</span>
                  </div>
                  <div className="text-[9px] text-slate-700 mt-0.5">2 Students marked Present via camera.</div>
                </div>

                {/* Updated Counters */}
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div className="p-2 rounded-xl bg-[#DCFCE7] border-2 border-black text-center">
                    <div className="text-base font-black text-[#16A34A] leading-tight">2</div>
                    <div className="text-[9px] font-black text-black">PRESENT</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEE2E2] border-2 border-black text-center">
                    <div className="text-base font-black text-[#DC2626] leading-tight">1</div>
                    <div className="text-[9px] font-black text-black">ABSENT</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FEF3C7] border-2 border-black text-center">
                    <div className="text-base font-black text-[#92400E] leading-tight">0</div>
                    <div className="text-[9px] font-black text-black">LATE</div>
                  </div>
                </div>

                {/* Verified Student List */}
                <div className="space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">ATTENDANCE STATUS</div>

                  <div className="p-2 rounded-xl bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                        H
                      </div>
                      <span className="font-bold text-black">Himanshu Anand</span>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-[#16A34A] text-white">
                      [P] PRESENT
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#DCFCE7] border border-[#16A34A] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white text-[9px] font-black flex items-center justify-center">
                        Y
                      </div>
                      <span className="font-bold text-black">Yash Anand</span>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-[#16A34A] text-white">
                      [P] PRESENT
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-slate-300 flex items-center justify-between text-xs opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-black flex items-center justify-center">
                        A
                      </div>
                      <span className="font-medium text-slate-700">Ankit Kumar</span>
                    </div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      [A] ABSENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Confirm Button matching BrutalButton */}
              <div>
                {confirmed ? (
                  <div className="p-2 rounded-xl bg-[#16A34A] text-white font-black text-[10px] text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>SAVED TO DATABASE!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmed(true)}
                    className="w-full py-2 rounded-xl bg-[#FFB800] hover:bg-[#FFC700] text-black font-black text-xs uppercase border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>CONFIRM ATTENDANCE</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setConfirmed(false);
                    handleNext(0);
                  }}
                  className="w-full mt-2 text-[9px] text-slate-500 hover:text-black flex items-center justify-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restart flow</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tab Navigation Bar matching mobile/app/(tabs)/_layout.tsx */}
      <div className="px-3 py-2 bg-white border-t-2 border-black flex items-center justify-around z-20">
        <div className="flex flex-col items-center opacity-40">
          <Home className="w-4 h-4 text-black" />
          <span className="text-[8px] font-black uppercase mt-0.5">Home</span>
        </div>

        {/* Active Attend tab with yellow highlight box matching mobile */}
        <div className="flex flex-col items-center px-2.5 py-1 rounded-lg bg-[#FFB800]/30 border border-black/40">
          <ScanFace className="w-4 h-4 text-[#FF6B35]" />
          <span className="text-[8px] font-black uppercase text-[#FF6B35] mt-0.5">Attend</span>
        </div>

        <div className="flex flex-col items-center opacity-40">
          <BarChart2 className="w-4 h-4 text-black" />
          <span className="text-[8px] font-black uppercase mt-0.5">Reports</span>
        </div>

        <div className="flex flex-col items-center opacity-40">
          <User className="w-4 h-4 text-black" />
          <span className="text-[8px] font-black uppercase mt-0.5">Profile</span>
        </div>
      </div>
    </div>
  );
}
