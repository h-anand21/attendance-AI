'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Download, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/ui/app-logo';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Mobile App', href: '#mobile-app' },
  { label: 'Web Analytics', href: '#web-analytics' },
  { label: 'Download APK', href: '#download-apk' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F19] text-[#F1F5F9] selection:bg-amber-400 selection:text-black">
      {/* Sticky Refined Dark Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0B0F19]/90 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-sm group-hover:border-amber-400 transition-colors">
              <AppLogo className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                AttendEase
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">AI Biometrics</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-slate-300 transition-colors hover:text-amber-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/AttendEase-Release.apk"
              download="AttendEase-v1.0.1.apk"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm active:translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>Download APK</span>
            </a>
            <Button
              variant="ghost"
              asChild
              className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Navigation Drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#0A0C11] border-r border-slate-800 text-white p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2.5 pb-6 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 flex items-center justify-center">
                    <AppLogo className="h-5 w-5 text-[#FFB800]" />
                  </div>
                  <span className="font-black text-white text-lg">AttendEase</span>
                </div>
                <nav className="flex flex-col gap-4 py-6 font-semibold">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-slate-300 text-base py-2 hover:text-[#FFB800] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col gap-3">
                  <a
                    href="/AttendEase-Release.apk"
                    download="AttendEase-v1.0.1.apk"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000000]"
                  >
                    <Download className="w-4 h-4 text-black stroke-[3]" />
                    <span>Download APK (136 MB)</span>
                  </a>
                  <Button variant="outline" asChild className="w-full border-slate-700 bg-slate-900 text-white">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 bg-[#08090C]">{children}</main>

      {/* Pure Black Dark Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050608] text-slate-400">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(255,184,0,0.2)]">
                  <AppLogo className="h-5 w-5 text-[#FFB800]" />
                </div>
                <span className="font-black text-white text-lg tracking-tight">AttendEase</span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Next-Gen AI Biometric Attendance ecosystem for modern schools, colleges, and enterprise classrooms.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>v1.0.1 Production Released</span>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Platform</h4>
              <div className="grid gap-2.5 text-xs">
                <Link href="#mobile-app" className="hover:text-[#FFB800] transition-colors">
                  Mobile App (4-Step Flow)
                </Link>
                <Link href="#web-analytics" className="hover:text-[#FFB800] transition-colors">
                  Web Analytics & Reports
                </Link>
                <Link href="#features" className="hover:text-[#FFB800] transition-colors">
                  AI Face Recognition 1080p
                </Link>
                <a href="/AttendEase-Release.apk" download="AttendEase-v1.0.1.apk" className="text-[#FFB800] hover:underline font-bold flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>Direct Download APK</span>
                </a>
              </div>
            </div>

            {/* Solutions Column */}
            <div>
              <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Features</h4>
              <div className="grid gap-2.5 text-xs">
                <span className="text-slate-400">Multi-Face Continuous Scan</span>
                <span className="text-slate-400">Classroom Photo Batch Scan</span>
                <span className="text-slate-400">Student QR Code Badges</span>
                <span className="text-slate-400">Automated Excel/PDF Export</span>
                <span className="text-slate-400">Real-Time Cloud DB Sync</span>
              </div>
            </div>

            {/* Quick Access Column */}
            <div>
              <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Quick Access</h4>
              <div className="grid gap-2.5 text-xs">
                <Link href="/login" className="hover:text-[#FFB800] transition-colors">
                  Teacher Login
                </Link>
                <Link href="/dashboard" className="hover:text-[#FFB800] transition-colors">
                  Web Admin Dashboard
                </Link>
                <Link href="/reports" className="hover:text-[#FFB800] transition-colors">
                  Attendance Reports
                </Link>
                <a href="/api/download-apk" className="hover:text-[#FFB800] transition-colors">
                  APK Server Mirror
                </a>
              </div>
            </div>
          </div>

          {/* Copyright Sub-bar */}
          <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} AttendEase AI Biometrics. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-slate-400 font-mono">System Status: All Services Operational</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
