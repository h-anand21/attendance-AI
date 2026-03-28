
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanFace, Upload, QrCode, UserPlus, FileBarChart, CheckCircle, School, User } from 'lucide-react';
import Image from 'next/image';
import MarketingLayout from './(marketing)/layout';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <ScanFace className="h-8 w-8 text-primary" />,
    title: 'Face Scan Session',
    description: 'Take attendance for the whole class with a continuous, real-time face scan.',
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

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function LandingPage() {
  const headlineText = "Automated attendance that actually works.";

  return (
    <MarketingLayout>
      <div className="flex flex-col min-h-screen relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

        <main className="flex-1 relative z-10">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-24">
            <div className="container text-center">
              <div className="max-w-4xl mx-auto">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                    {headlineText}
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 text-xl leading-8 text-muted-foreground max-w-2xl mx-auto"
                >
                  Experience the future of classroom management with AI face scans, smart photo analysis, and instant QR check-ins.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link href="/login" className="w-full sm:w-auto">
                    <GlassButton variant="primary" size="lg" className="w-full shadow-2xl">
                      Get Started for Free
                    </GlassButton>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <GlassButton size="lg" className="w-full">
                      Watch Demo
                    </GlassButton>
                  </Link>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-16 sm:mt-24 relative"
              >
                <div className="relative w-full max-w-5xl mx-auto group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <Card className="relative glass border-white/20 overflow-hidden shadow-2xl rounded-2xl">
                    <Image
                      src="https://i.postimg.cc/gJf7dmf5/Screenshot-2025-09-09-233520.png"
                      alt="AttendEase App Dashboard"
                      width={1200}
                      height={675}
                      className="w-full"
                      data-ai-hint="app dashboard"
                      priority
                    />
                  </Card>
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
                  <Card className="text-center p-8 glass border-white/10 hover:border-primary/50 transition-all duration-300 h-full">
                    <CardHeader className="p-0 items-center">
                      <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-2xl text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 text-sm text-muted-foreground leading-relaxed">
                      <p>{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How it Works Section */}
          <section id="how-it-works" className="py-24 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px]" />
            <div className="container relative z-10">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">A Simple 3-Step Process</h2>
                <p className="mt-4 text-lg text-muted-foreground">Automating your classroom is as easy as 1-2-3.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {howItWorksSteps.map((step, i) => (
                  <motion.div 
                    key={step.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-8 p-6 glass rounded-full text-primary shadow-inner">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="pricing" className="container py-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto glass border-white/20 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16" />
              
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">Ready to Start?</h2>
              <p className="mt-4 text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join the modern classroom revolution. Save hours every week and focus on what matters most: teaching.
              </p>
              <Link href="/login">
                <GlassButton variant="primary" size="lg" className="h-16 px-12 text-lg rounded-2xl shadow-2xl">
                  Sign Up and Save Time
                </GlassButton>
              </Link>
            </motion.div>
          </section>
        </main>
      </div>
    </MarketingLayout>
  );
}
