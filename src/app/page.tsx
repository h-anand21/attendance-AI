
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CheckCircle, Zap, Shield, BarChart, Star } from 'lucide-react';
import Image from 'next/image';
import { AppLogo } from '@/components/ui/app-logo';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Instant Face Recognition',
    description:
      'Take attendance for the entire class in seconds. Our AI accurately recognizes registered students from a single photo or live feed.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Automated Record Keeping',
    description:
      'Say goodbye to manual entry. Attendance is automatically logged, saving you time and reducing errors.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Insightful Analytics',
    description:
      "Track trends and identify at-risk students with AI-powered summaries and anomaly detection. It's not just data; it's insight.",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: 'Secure & Private',
    description:
      'Student data is handled with the utmost care, ensuring privacy and security are always a top priority.',
  },
];

const testimonials = [
  {
    name: 'Sarah J., High School Teacher',
    quote:
      "AttendEase has been a game-changer. I've saved at least 10 minutes every single class. The AI analytics helped me identify a student who needed extra support.",
    avatar: 'https://picsum.photos/seed/sarah/100/100',
  },
  {
    name: 'Dr. Michael Chen, University Professor',
    quote:
      'In a lecture hall of 200 students, this is the only tool that has made attendance feasible without wasting valuable teaching time. The accuracy is impressive.',
    avatar: 'https://picsum.photos/seed/michael/100/100',
  },
  {
    name: 'Linda Rodriguez, School Administrator',
    quote:
      'We rolled out AttendEase across our district. The reduction in administrative overhead for attendance has been significant, and the reports are invaluable.',
    avatar: 'https://picsum.photos/seed/linda/100/100',
  },
  {
    name: 'David Lee, Coding Bootcamp Instructor',
    quote:
      "The setup was incredibly easy, and my students found the face scan process quick and non-intrusive. Highly recommended for any modern classroom.",
    avatar: 'https://picsum.photos/seed/david/100/100',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-24 sm:py-32">
          <div className="container text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  Smarter Attendance, Simplified
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl fade-in" style={{ animationDelay: '0.4s' }}>
                Focus on Teaching, Not Roll Calling
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground fade-in" style={{ animationDelay: '0.6s' }}>
                AttendEase uses AI-powered face recognition to make classroom
                attendance fast, accurate, and insightful. Reclaim your
                teaching time.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 fade-in" style={{ animationDelay: '0.8s' }}>
                <Button size="lg" asChild>
                  <Link href="/login">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild>
                  <Link href="#features">Learn More &rarr;</Link>
                </Button>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 slide-in-from-bottom" style={{ animationDelay: '1s' }}>
              <div className="relative w-full max-w-5xl mx-auto">
                 <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl"></div>
                 <div className="relative shadow-2xl rounded-2xl overflow-hidden border">
                    <Image
                      src="https://picsum.photos/seed/dashboard/1200/675"
                      alt="App screenshot"
                      width={1200}
                      height={675}
                      className="w-full"
                      data-ai-hint="app dashboard"
                    />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Streamline Attendance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From instant scanning to powerful analytics, we've got you
              covered.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div key={feature.title} className="p-6 bg-background rounded-lg slide-in-from-bottom" style={{ animationDelay: `${i * 0.1}s`}}>
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* App Preview Section */}
        <section className="bg-primary/5">
            <div className="container grid md:grid-cols-2 gap-12 items-center">
                <div className="slide-in-from-bottom">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Works Where You Do
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Access AttendEase from any device with a web browser. Our responsive design ensures a seamless experience whether you're on a desktop, tablet, or smartphone.
                    </p>
                     <Button size="lg" className="mt-8" asChild>
                        <Link href="/login">Try it on Your Device</Link>
                    </Button>
                </div>
                <div className="slide-in-from-bottom" style={{ animationDelay: '0.2s' }}>
                    <Image
                      src="https://picsum.photos/seed/devices/600/500"
                      alt="App on multiple devices"
                      width={600}
                      height={500}
                      className="rounded-xl shadow-2xl"
                      data-ai-hint="app on devices"
                    />
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by Educators Everywhere
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what teachers, professors, and administrators are saying
              about AttendEase.
            </p>
          </div>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-screen-lg mx-auto mt-16"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1 h-full">
                    <Card className="h-full flex flex-col">
                      <CardContent className="pt-6 flex-grow">
                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-muted-foreground">
                          "{testimonial.quote}"
                        </p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center gap-4">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                            data-ai-hint="person portrait"
                          />
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
        
        {/* Pricing/CTA Section */}
        <section id="pricing" className="bg-primary/5">
            <div className="container text-center max-w-3xl mx-auto">
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
  );
}
