'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanFace,
  QrCode,
  Upload,
  Download,
  Check,
  CheckCircle2,
  Camera,
  RefreshCw,
  Users,
  Sparkles,
  FileSpreadsheet,
  Globe
} from 'lucide-react';

interface WebAttendanceSimulatorProps {
  autoPlay?: boolean;
}

export function WebAttendanceSimulator({ autoPlay = true }: WebAttendanceSimulatorProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  // 0: Class View with Action Buttons & Pending Roster
  // 1: Live AI Web Scanner Modal Active
  // 2: Verified Students Marked Present & Confirmed
  const [isExporting, setIsExporting] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Auto-cycle through the 3 web attendance steps every 4.5 seconds
  useEffect(() => {
    if (!autoPlay || userInteracted) return;
    const interval = setInterval(() => {
      setStep((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, userInteracted]);

  const handleStep = (next: 0 | 1 | 2) => {
    setUserInteracted(true);
    setStep(next);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#0D0F17] text-white flex flex-col justify-between overflow-hidden select-none font-sans border border-slate-800">
      {/* Top Browser Bar */}
      <div className="px-3 py-1.5 bg-[#080A10] border-b border-slate-800/90 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <div className="ml-2 px-2.5 py-0.5 rounded bg-black/60 border border-slate-800 font-mono text-[9px] text-slate-400 flex items-center gap-1.5">
            <Globe className="w-2.5 h-2.5 text-[#FFB800]" />
            <span>attendease.cloud/attendance/class-9a</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Web Cloud Synced</span>
        </div>
      </div>

      {/* Main Web Attendance App Area */}
      <div className="flex-1 p-3.5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0E111B] to-[#0A0C13]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">Class 9 - Section A</h3>
              <span className="px-1.5 py-0.2 rounded bg-[#FFB800]/20 text-[#FFB800] text-[8px] font-black border border-[#FFB800]/40">
                14 Students
              </span>
            </div>
            <p className="text-[9px] text-slate-400">Teacher: Himanshu Anand • Session Active</p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStep(1)}
              className="px-2.5 py-1 rounded-lg bg-[#FF6B35] hover:bg-[#FF7D4D] text-white text-[9px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000000] transition-transform active:translate-y-0.5"
            >
              <ScanFace className="w-3 h-3" />
              <span>Face Scan</span>
            </button>
            <button
              onClick={handleExport}
              className="px-2 py-1 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 text-[9px] font-bold border border-slate-700 flex items-center gap-1"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3 h-3 text-[#22C55E] animate-spin" />
                  <span className="text-[#22C55E]">Exporting...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3 h-3 text-[#22C55E]" />
                  <span>Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Content depending on step */}
        <div className="flex-1 my-2 relative flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STEP 0: Pending Web Roster & Quick Actions */}
            {step === 0 && (
              <motion.div
                key="web-step-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-[#141824] border border-slate-800 text-center">
                    <div className="text-xs font-black text-slate-300">14</div>
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Enrolled</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <div className="text-xs font-black text-emerald-400">0</div>
                    <div className="text-[8px] text-emerald-400 font-bold uppercase">Present</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                    <div className="text-xs font-black text-red-400">14</div>
                    <div className="text-[8px] text-red-400 font-bold uppercase">Pending</div>
                  </div>
                </div>

                {/* Table representation */}
                <div className="rounded-lg bg-[#0B0D14] border border-slate-800 overflow-hidden">
                  <div className="px-2.5 py-1 bg-slate-900/60 border-b border-slate-800 grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase">
                    <span className="col-span-6">Student Name</span>
                    <span className="col-span-3 text-center">Roll No</span>
                    <span className="col-span-3 text-right">Status</span>
                  </div>
                  {[
                    { name: 'Himanshu Anand', roll: '01' },
                    { name: 'Yash Anand', roll: '02' },
                    { name: 'Ankit Kumar', roll: '03' }
                  ].map((st) => (
                    <div
                      key={st.roll}
                      className="px-2.5 py-1.5 border-b border-slate-900 grid grid-cols-12 items-center text-[10px]"
                    >
                      <div className="col-span-6 flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 text-[8px] font-bold flex items-center justify-center">
                          {st.name[0]}
                        </div>
                        <span className="font-semibold text-slate-200 truncate">{st.name}</span>
                      </div>
                      <span className="col-span-3 text-center font-mono text-[9px] text-slate-400">{st.roll}</span>
                      <div className="col-span-3 flex justify-end">
                        <span className="px-1.5 py-0.2 rounded bg-red-900/30 text-red-400 border border-red-800/40 text-[7px] font-bold">
                          ABSENT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Launch Scanner Trigger */}
                <button
                  onClick={() => handleStep(1)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-gradient-to-r from-[#FFB800] to-[#FF6B35] text-black font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-1.5 hover:opacity-95"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Web Face Recognition</span>
                </button>
              </motion.div>
            )}

            {/* STEP 1: Live Web AI Camera Scanner Active */}
            {step === 1 && (
              <motion.div
                key="web-step-1"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between rounded-xl bg-black border border-emerald-500/40 p-2.5 relative overflow-hidden"
              >
                {/* Top Viewport Header */}
                <div className="flex items-center justify-between text-[9px] relative z-10">
                  <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-mono font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    HD WEBCAM LIVE
                  </span>
                  <span className="text-[#FFB800] font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#FFB800]" />
                    Gemini Vision 2.0
                  </span>
                </div>

                {/* Center Laser & Viewfinder */}
                <div className="relative w-40 h-28 mx-auto my-auto flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#22C55E]" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#22C55E]" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#22C55E]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#22C55E]" />

                  {/* Horizontal scanning laser */}
                  <motion.div
                    animate={{ y: [-35, 35, -35] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_10px_#22C55E]"
                  />

                  {/* Detected Badges */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
                    <div className="px-2 py-0.5 rounded bg-black/90 border border-emerald-400 text-emerald-400 text-[8px] font-bold flex items-center gap-1 shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Himanshu Anand (99.4%)</span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-black/90 border border-emerald-400 text-emerald-400 text-[8px] font-bold flex items-center gap-1 shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Yash Anand (98.8%)</span>
                    </div>
                  </div>
                </div>

                {/* Shutter / Save button */}
                <button
                  onClick={() => handleStep(2)}
                  className="w-full py-1.5 rounded-lg bg-[#22C55E] hover:bg-emerald-400 text-black font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-1 relative z-10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>Mark 2 Recognized Students</span>
                </button>
              </motion.div>
            )}

            {/* STEP 2: Attendance Confirmed & Synced */}
            {step === 2 && (
              <motion.div
                key="web-step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Confirmation banner */}
                <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Attendance Marked & Synced to Cloud DB!</span>
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400">100% Audit Ready</span>
                </div>

                {/* Updated Table */}
                <div className="rounded-lg bg-[#0B0D14] border border-slate-800 overflow-hidden">
                  <div className="px-2.5 py-1 bg-slate-900/60 border-b border-slate-800 grid grid-cols-12 text-[8px] font-bold text-slate-400 uppercase">
                    <span className="col-span-6">Student Name</span>
                    <span className="col-span-3 text-center">Roll No</span>
                    <span className="col-span-3 text-right">Status</span>
                  </div>

                  <div className="px-2.5 py-1.5 border-b border-slate-900 grid grid-cols-12 items-center text-[10px] bg-emerald-500/5">
                    <div className="col-span-6 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">
                        H
                      </div>
                      <span className="font-bold text-emerald-200 truncate">Himanshu Anand</span>
                    </div>
                    <span className="col-span-3 text-center font-mono text-[9px] text-slate-400">01</span>
                    <div className="col-span-3 flex justify-end">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[7px] font-black">
                        PRESENT
                      </span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1.5 border-b border-slate-900 grid grid-cols-12 items-center text-[10px] bg-emerald-500/5">
                    <div className="col-span-6 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">
                        Y
                      </div>
                      <span className="font-bold text-emerald-200 truncate">Yash Anand</span>
                    </div>
                    <span className="col-span-3 text-center font-mono text-[9px] text-slate-400">02</span>
                    <div className="col-span-3 flex justify-end">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[7px] font-black">
                        PRESENT
                      </span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1.5 grid grid-cols-12 items-center text-[10px] opacity-60">
                    <div className="col-span-6 flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[8px] font-bold flex items-center justify-center">
                        A
                      </div>
                      <span className="font-medium text-slate-400 truncate">Ankit Kumar</span>
                    </div>
                    <span className="col-span-3 text-center font-mono text-[9px] text-slate-400">03</span>
                    <div className="col-span-3 flex justify-end">
                      <span className="px-1.5 py-0.2 rounded bg-red-900/30 text-red-400 border border-red-800/40 text-[7px] font-bold">
                        ABSENT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Restart / Switch */}
                <button
                  onClick={() => handleStep(0)}
                  className="w-full mt-2 text-[8px] text-slate-500 hover:text-white flex items-center justify-center gap-1 font-bold"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Restart Web Demo</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Footer Note */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
          <span>Database: PostgreSQL + Supabase Cloud</span>
          <span className="text-[#FFB800] font-bold">100% Realtime Sync</span>
        </div>
      </div>
    </div>
  );
}
