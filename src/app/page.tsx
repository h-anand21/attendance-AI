'use client';

import Link from 'next/link';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/ui/glass-card';
import { ScanFace, Upload, QrCode, UserPlus, FileBarChart, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import MarketingLayout from './(marketing)/layout';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <ScanFace className="h-8 w-8 text-primary" />,
    title: 'Face Scan Session',
    description: 'Take attendance for the whole class with a continuous, real-time AI face scan.',
  },
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: 'Photo Upload',
    description: 'Process a single class photo to instantly mark everyone who is present.',
  },
  {
    icon: <QrCode className="h-8 w-8 text-primary" />,
    title: 'QR & RFID Check-in',
    description: 'Allow students to quickly scan their unique ID cards for attendance.',
  },
];

const howItWorksSteps = [
  {
    icon: <UserPlus className="h-10 w-10 text-primary" />,
    title: '1. Register',
    description: 'Admins securely register students and teachers, capturing photos for AI recognition.',
  },
  {
    icon: <ScanFace className="h-10 w-10 text-primary" />,
    title: '2. Scan',
    description: 'Teachers take attendance in seconds using face scan, photo upload, or QR codes.',
  },
  {
    icon: <FileBarChart className="h-10 w-10 text-primary" />,
    title: '3. Report',
    description: 'Gain insights with AI-powered anomaly detection and export detailed reports to Excel.',
  },
];

export default function LandingPage() {
  return (
    <MarketingLayout>
      <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
        {/* Animated Background Blobs */}
        <div className="absolute top-[10%] left-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />

        <main className="flex-1 relative z-10">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-24">
            <div className="container text-center">
              <div className="max-w-4xl mx-auto">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl md:text-8xl"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    Smart Attendance.
                  </span>
                  <br />
                  <span className="text-foreground/90">Powered by AI.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-8 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto"
                >
                  The most advanced classroom management platform with real-time face recognition, smart photo analysis, and instant QR check-ins.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                  <Link href="/login" className="w-full sm:w-auto">
                    <GlassButton variant="primary" size="lg" className="w-full shadow-[0_0_30px_rgba(var(--primary),0.4)] h-16 px-12 text-lg font-bold rounded-2xl">
                      Get Started Free
                    </GlassButton>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <GlassButton size="lg" className="w-full h-16 px-12 text-lg rounded-2xl">
                      See How it Works
                    </GlassButton>
                  </Link>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-20 sm:mt-28 relative"
              >
                <div className="relative w-full max-w-6xl mx-auto group">
                   <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                  <GlassCard className="relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] border-white/20 p-2">
                    <Image
                      src="https://i.postimg.cc/gJf7dmf5/Screenshot-2025-09-09-233520.png"
                      alt="AttendEase App Dashboard"
                      width={1200}
                      height={675}
                      className="w-full rounded-[2rem]"
                      data-ai-hint="app dashboard"
                      priority
                    />
                  </GlassCard>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="container relative py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="text-center p-10 h-full flex flex-col items-center">
                    <div className="mb-8 inline-flex p-5 bg-primary/15 rounded-[2rem] text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]">
                      {feature.icon}
                    </div>
                    <GlassCardTitle className="text-2xl font-bold mb-4">{feature.title}</GlassCardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How it Works Section */}
          <section id="how-it-works" className="py-24 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 backdrop-blur-[4px]" />
            <div className="container relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">Simple 3-Step Process</h2>
                <p className="text-xl text-muted-foreground">Automating your classroom takes just a few clicks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                {howItWorksSteps.map((step, i) => (
                  <motion.div 
                    key={step.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-10 p-8 glass rounded-[3rem] text-primary shadow-2xl scale-110">
                      {step.icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground max-w-xs text-lg">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container py-24 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-5xl mx-auto glass border-white/20 rounded-[3rem] p-16 md:p-24 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -ml-32 -mb-32" />
              
              <h2 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">Ready for the Future?</h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Join thousands of modern educators. Save hours every week and focus on what matters most: your students.
              </p>
              <Link href="/login">
                <GlassButton variant="primary" size="lg" className="h-18 px-14 text-xl font-bold rounded-2xl shadow-[0_0_40px_rgba(var(--primary),0.5)] scale-110 hover:scale-115">
                  Get Started Now
                </GlassButton>
              </Link>
            </motion.div>
          </section>
        </main>
      </div>
    </MarketingLayout>
  );
}