
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScanFace, Upload, QrCode, UserPlus, FileBarChart, CheckCircle, School, User, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import MarketingLayout from './(marketing)/layout';


const features = [
  {
    icon: <ScanFace className="h-8 w-8 text-accent" />,
    title: 'Face Scan Session',
    description:
      'Take attendance for the whole class with a continuous, real-time face scan.',
  },
  {
    icon: <Upload className="h-8 w-8 text-accent" />,
    title: 'Photo Upload',
    description:
      'Process a single class photo to instantly mark everyone who is present.',
  },
   {
    icon: <QrCode className="h-8 w-8 text-accent" />,
    title: 'QR & RFID Check-in',
    description:
      'Allow students to quickly scan their unique ID cards for attendance.',
  },
];

const howItWorksSteps = [
    {
        icon: <UserPlus className="h-10 w-10 text-primary" />,
        title: "1. Register",
        description: "Admins securely register students and teachers, capturing photos for AI recognition."
    },
    {
        icon: <ScanFace className="h-10 w-10 text-primary" />,
        title: "2. Scan",
        description: "Teachers take attendance in seconds using face scan, photo upload, or QR codes."
    },
    {
        icon: <FileBarChart className="h-10 w-10 text-primary" />,
        title: "3. Report",
        description: "Gain insights with AI-powered anomaly detection and export detailed reports to Excel."
    }
]

export default function LandingPage() {
  return (
    <MarketingLayout>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-background py-24 sm:py-32">
            <div className="container text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl fade-in" style={{ animationDelay: '0.2s' }}>
                  Automated attendance that actually works.
                </h1>
                <p className="mt-6 text-xl leading-8 text-muted-foreground fade-in" style={{ animationDelay: '0.4s' }}>
                  AI-driven face scans, photo uploads, and QR check-ins — fast, accurate, and easy.
                  Free up teaching time and gain valuable insights.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6 fade-in" style={{ animationDelay: '0.6s' }}>
                  <Button size="lg" asChild>
                    <Link href="/login">Get Started for Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#how-it-works">Watch Demo</Link>
                  </Button>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 slide-in-from-bottom" style={{ animationDelay: '0.8s' }}>
                <div className="relative w-full max-w-5xl mx-auto">
                  <div className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl"></div>
                  <div className="relative shadow-2xl rounded-2xl overflow-hidden border">
                      <Image
                        src="https://picsum.photos/seed/dashboard-ui/1200/675"
                        alt="AttendEase App Dashboard"
                        width={1200}
                        height={675}
                        className="w-full"
                        data-ai-hint="app dashboard"
                        priority
                      />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, i) => (
                <Card key={feature.title} className="text-center p-6 bg-card rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2 slide-in-from-bottom" style={{ animationDelay: `${i * 0.15}s`}}>
                  <CardHeader className="p-0 items-center">
                    <div className="mb-4 inline-block p-4 bg-primary/10 rounded-xl">{feature.icon}</div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2 text-muted-foreground">
                    <p>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How it Works Section */}
          <section id="how-it-works" className="bg-secondary">
              <div className="container">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        A Simple 3-Step Process
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Get up and running with AttendEase in no time.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {howItWorksSteps.map((step, i) => (
                        <div key={step.title} className="flex flex-col items-center slide-in-from-bottom" style={{ animationDelay: `${i * 0.2}s`}}>
                            <div className="mb-6 p-4 bg-primary/10 rounded-full">
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground max-w-xs">{step.description}</p>
                        </div>
                    ))}
                </div>
              </div>
          </section>
          
           {/* For Every Role Section */}
          <section id="roles" className="container">
             <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Powerful Tools for Every Role
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Whether you're an administrator or a teacher, AttendEase is designed for you.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-2xl shadow-lg slide-in-from-bottom">
                    <CardHeader className="p-0 flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg"><School className="h-8 w-8 text-primary" /></div>
                        <CardTitle className="text-2xl font-semibold">For Admins</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-3 text-muted-foreground">
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>Centralized student and teacher registration.</span></p>
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>View and export detailed attendance reports for compliance.</span></p>
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>Use AI to detect attendance anomalies across the school.</span></p>
                    </CardContent>
                </Card>
                 <Card className="p-8 rounded-2xl shadow-lg slide-in-from-bottom" style={{ animationDelay: `0.15s`}}>
                    <CardHeader className="p-0 flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg"><User className="h-8 w-8 text-primary" /></div>
                        <CardTitle className="text-2xl font-semibold">For Teachers</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-3 text-muted-foreground">
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>Take attendance in seconds, not minutes.</span></p>
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>Eliminate manual data entry and paperwork.</span></p>
                        <p className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" /><span>Focus on teaching, not administrative tasks.</span></p>
                    </CardContent>
                </Card>
            </div>
          </section>

          {/* Reports preview Section */}
          <section className="bg-secondary">
              <div className="container grid md:grid-cols-2 gap-12 items-center">
                  <div className="slide-in-from-bottom">
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                          Go Beyond Data. Get Insights.
                      </h2>
                      <p className="mt-4 text-lg text-muted-foreground">
                          Our reports don't just show you who was in class. They help you understand attendance patterns with AI-driven anomaly detection and easy-to-read charts. Export everything to Excel with a single click.
                      </p>
                      <Button size="lg" className="mt-8" asChild>
                          <Link href="/login">Explore Reports</Link>
                      </Button>
                  </div>
                  <div className="slide-in-from-bottom" style={{ animationDelay: '0.2s' }}>
                      <Image
                        src="https://picsum.photos/seed/reports-ui/600/500"
                        alt="App reports page showing charts and data"
                        width={600}
                        height={500}
                        className="rounded-2xl shadow-2xl border"
                        data-ai-hint="app reports chart"
                      />
                  </div>
              </div>
          </section>

          {/* Pricing/CTA Section */}
          <section id="pricing" className="container">
              <div className="text-center max-w-3xl mx-auto bg-primary/5 rounded-2xl p-10 md:p-16">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Ready to Revolutionize Your Classroom?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                      Join thousands of educators who are saving time and gaining valuable insights. Get started with AttendEase today for free. No credit card required.
                  </p>
                  <Button size="lg" className="mt-8" asChild>
                      <Link href="/login">Sign Up and Start Saving Time</Link>
                  </Button>
              </div>
          </section>

        </main>
      </div>
    </MarketingLayout>
  );
}
