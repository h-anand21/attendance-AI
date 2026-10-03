'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanFace,
  QrCode,
  Upload,
  Check,
  CheckCircle2,
  Camera,
  Users,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  UserCheck,
  Flame,
  ChevronRight
} from 'lucide-react';

interface MobileAttendanceSimulatorProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function MobileAttendanceSimulator({
  currentStep,
  onStepChange,
}: MobileAttendanceSimulatorProps) {
  const [internalStep, setInternalStep] = useState(currentStep);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Sync with parent step change
  useEffect(() => {
    setInternalStep(currentStep);
    if (currentStep === 2) {
      // Step 3 (0-indexed 2) is Face scan
      setIsScanning(true);
      const timer1 = setTimeout(() => setDetectedCount(1), 600);
      const timer2 = setTimeout(() => setDetectedCount(2), 1200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setIsScanning(false);
      setDetectedCount(currentStep === 3 ? 2 : 0);
    }
  }, [currentStep]);

  const handleNext = (nextIdx: number) => {
    setInternalStep(nextIdx);
    onStepChange?.(nextIdx);
  };

  return (
    <div className="w-full h-full bg-[#08090E] text-slate-100 flex flex-col justify-between overflow-hidden relative select-none font-sans">
      {/* Top Mobile Status Bar */}
      <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 bg-black/60">
        <span className="font-bold text-white">09:14</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-emerald-400 font-bold">5G</span>
          <span>100%</span>
        </div>
      </div>

      {/* Dynamic Screen Content Based on Step */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* STEP 1: CLASS SELECTION */}
          {/* ========================================================== */}
          {internalStep === 0 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Header Banner */}
                <div className="p-3 rounded-xl bg-[#FFB800] text-black border-2 border-black shadow-[3px_3px_0px_#000000] mb-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-black/70">TODAY&apos;S SCHEDULE</div>
                  <div className="text-sm font-black uppercase">Saturday, 28 Sep</div>
                  <div className="text-[11px] font-bold mt-0.5 text-black/90">Select a class to begin attendance</div>
                </div>

                {/* Class List Cards */}
                <div className="space-y-2.5">
                  {[
                    { name: 'Class 9 - Section A', room: 'Room 204 • Morning Session', count: '16 Students', isTarget: true },
                    { name: 'Class 10 - Section B', room: 'Room 108 • Afternoon Session', count: '24 Students', isTarget: false },
                    { name: 'Class 11 - Section A', room: 'Physics Lab • 11:30 AM', count: '20 Students', isTarget: false },
                  ].map((cls, idx) => (
                    <motion.div
                      key={cls.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNext(1)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        cls.isTarget
                          ? 'bg-[#151924] border-[#FFB800] shadow-[3px_3px_0px_#FFB800]'
                          : 'bg-[#0E1017] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-white">{cls.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{cls.room}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black border border-slate-700 text-[#FFB800] font-bold">
                            {cls.count}
                          </span>
                        </div>
                      </div>
                      {cls.isTarget && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-[#FFB800] font-bold">
                          <span>👉 Tap to open class</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <button
                onClick={() => handleNext(1)}
                className="w-full mt-3 py-2.5 rounded-xl bg-[#FFB800] text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-1.5 hover:bg-[#FFC700]"
              >
                <span>Select Class 9 - Section A</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 2: CLASS ATTENDANCE DASHBOARD (MODES) */}
          {/* ========================================================== */}
          {internalStep === 1 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase">ACTIVE CLASSROOM</span>
                    <h4 className="text-sm font-black text-white">Class 9 - Section A</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Live Session
                  </span>
                </div>

                {/* 3 Status Counters (Present, Absent, Late) */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[#0F1418] border-2 border-emerald-500/40 text-center">
                    <div className="text-[9px] font-bold text-emerald-400 uppercase">Present</div>
                    <div className="text-base font-black text-white">0</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#140F11] border-2 border-red-500/40 text-center">
                    <div className="text-[9px] font-bold text-red-400 uppercase">Absent</div>
                    <div className="text-base font-black text-white">3</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#14120D] border-2 border-[#FFB800]/40 text-center">
                    <div className="text-[9px] font-bold text-[#FFB800] uppercase">Late</div>
                    <div className="text-base font-black text-white">0</div>
                  </div>
                </div>

                {/* 3 Check-In Mode Triggers */}
                <div className="space-y-2 mb-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNext(2)}
                    className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#FFB800] to-[#FF6B35] text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ScanFace className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Live AI Face Scan</span>
                    </div>
                    <span className="text-[9px] bg-black text-[#FFB800] px-1.5 py-0.5 rounded font-black">Fastest</span>
                  </motion.button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNext(2)}
                      className="p-2 rounded-xl bg-[#111420] border-2 border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:border-slate-500"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>Scan QR</span>
                    </button>
                    <button
                      onClick={() => handleNext(2)}
                      className="p-2 rounded-xl bg-[#111420] border-2 border-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:border-slate-500"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                </div>

                {/* Preview of Students */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students (Pending)</div>
                  {['Himanshu Anand (Roll 01)', 'Yash Anand (Roll 02)', 'Ankit Kumar (Roll 03)'].map((name) => (
                    <div key={name} className="p-2 rounded-lg bg-[#0C0E14] border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        Absent
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA to start Face Scan */}
              <button
                onClick={() => handleNext(2)}
                className="w-full mt-3 py-2 rounded-xl bg-[#FFB800] text-black font-black text-xs uppercase tracking-wide border-2 border-black flex items-center justify-center gap-1.5"
              >
                <span>Launch Face Viewfinder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 3: LIVE 1080P AI CAMERA VIEWFINDER */}
          {/* ========================================================== */}
          {internalStep === 2 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-between relative overflow-hidden bg-slate-950 p-4"
            >
              {/* Camera Background Simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90" />

              {/* Top Viewfinder Bar */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  REC 1080p
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ML Kit Active</span>
              </div>

              {/* Center Viewfinder Framing Box */}
              <div className="relative z-10 w-48 h-48 mx-auto my-auto flex items-center justify-center">
                {/* 4 Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#FFB800]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#FFB800]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FFB800]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FFB800]" />

                {/* Moving Laser Scan Line */}
                <motion.div
                  animate={{ y: [-75, 75, -75] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent shadow-[0_0_12px_#22C55E]"
                />

                {/* Simulated Student Face Icons Detected */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {detectedCount >= 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2.5 py-1 rounded-md bg-black/80 border border-emerald-400 text-emerald-400 text-[10px] font-bold shadow-lg mb-1 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Himanshu Anand (99.4%)</span>
                    </motion.div>
                  )}
                  {detectedCount >= 2 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2.5 py-1 rounded-md bg-black/80 border border-emerald-400 text-emerald-400 text-[10px] font-bold shadow-lg flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Yash Anand (98.8%)</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bottom Camera Trigger */}
              <div className="relative z-10 text-center">
                <div className="text-[11px] font-bold text-slate-300 mb-2">
                  {detectedCount === 2 ? '🎉 2 Students Matched!' : 'Align student face in viewfinder'}
                </div>
                <button
                  onClick={() => handleNext(3)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-teal-400 text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4 text-black" />
                  <span>Mark Recognized (2/3)</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 4: INSTANT ATTENDANCE MARKED & CLOUD SYNC */}
          {/* ========================================================== */}
          {internalStep === 3 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Success Header */}
                <div className="p-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300 mb-3">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI Recognition Complete!</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">2 Students identified and marked Present.</div>
                </div>

                {/* Updated Counters */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border-2 border-emerald-500 text-center">
                    <div className="text-[9px] font-bold text-emerald-400 uppercase">Present</div>
                    <div className="text-base font-black text-emerald-300">2</div>
                  </div>
                  <div className="p-2 rounded-lg bg-red-950/40 border-2 border-red-500/60 text-center">
                    <div className="text-[9px] font-bold text-red-400 uppercase">Absent</div>
                    <div className="text-base font-black text-red-400">1</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#14120D] border-2 border-slate-700 text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Late</div>
                    <div className="text-base font-black text-white">0</div>
                  </div>
                </div>

                {/* Verified Student List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Status</div>

                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">Himanshu Anand</span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-black font-mono">
                      [P] PRESENT
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">Yash Anand</span>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-black font-mono">
                      [P] PRESENT
                    </span>
                  </motion.div>

                  <div className="p-2 rounded-lg bg-[#0C0E14] border border-slate-800 flex items-center justify-between text-xs opacity-70">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="font-semibold text-slate-300">Ankit Kumar</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                      [A] ABSENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Confirm Attendance Button */}
              <div>
                {confirmed ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Synced to Web Cloud in 0.4s!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmed(true)}
                    className="w-full py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#FFC700] text-black font-black text-xs uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Confirm Attendance (2 Present)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setConfirmed(false);
                    handleNext(0);
                  }}
                  className="w-full mt-2 py-1 text-[10px] text-slate-400 hover:text-white flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restart Mobile Demo Flow</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
