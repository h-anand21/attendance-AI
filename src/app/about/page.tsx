
'use client';

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanFace, Database, Lock, Cloudy, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const techPillars = [
    {
        icon: <ScanFace className="h-8 w-8 text-primary" />,
        title: "AI Face Recognition",
        description: "Powered by Genkit for fast, on-device matching."
    },
    {
        icon: <Cloudy className="h-8 w-8 text-primary" />,
        title: "Secure Cloud",
        description: "Firestore storage with strict access per school account."
    },
    {
        icon: <QrCode className="h-8 w-8 text-primary" />,
        title: "Multiple Check-ins",
        description: "Face scans, photo uploads, & QR codes for every classroom."
    }
]

export default function AboutPage() {
  return (
    <AppLayout pageTitle="About AttendEase">
      <motion.div
        className="max-w-5xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="text-center bg-card shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 p-10">
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                Making attendance effortless, accurate, and fair.
              </h1>
            </CardHeader>
            <CardContent className="p-10 text-lg text-muted-foreground">
              <p className="max-w-3xl mx-auto">
                AttendEase uses AI-driven face scans, photo uploads, and QR check-ins to save teachers time and give admins clear, actionable reports. Our mission is to eliminate the hassle of manual attendance tracking, transforming a routine task into an opportunity for insight.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.section variants={itemVariants}>
          <h2 className="text-3xl font-bold text-center mb-8">Our Technology Pillars</h2>
          <div className="grid md:grid-cols-3 gap-8">
              {techPillars.map((pillar) => (
                 <Card key={pillar.title} className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="items-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            {pillar.icon}
                        </div>
                        <CardTitle>{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                 </Card>
              ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
            <Card className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                           <Database className="h-8 w-8 text-primary" /> Data Source & Storage
                        </h2>
                        <div className="space-y-4 text-muted-foreground">
                           <p>
                              This application stores all of its data—including users, classes, students, and attendance records—in **Cloud Firestore**, a real-time database from Google Firebase. 
                           </p>
                           <p>
                              All data is stored securely under your unique User ID. When you first sign up, the application automatically seeds your database with sample data sourced from <code className="font-mono bg-muted/50 p-1 rounded-md text-sm">src/lib/data.ts</code>. Any changes you make are saved directly to your personal Firestore database, ensuring your data is persistent and secure.
                           </p>
                        </div>
                    </div>
                     <div className="flex items-center justify-center">
                        <img src="https://picsum.photos/seed/database-arch/400/300" alt="Database Architecture Diagram" className="rounded-lg shadow-md" data-ai-hint="database architecture" />
                    </div>
                </div>
            </Card>
        </motion.section>

      </motion.div>
    </AppLayout>
  );
}
