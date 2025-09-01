
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanFace, Database } from 'lucide-react';

export default function AboutPage() {
  return (
    <AppLayout pageTitle="About AttendEase">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <ScanFace className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-4xl font-bold">
              Welcome to AttendEase
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground text-center">
            <p>
              AttendEase is a modern, AI-powered solution designed to make
              classroom attendance simple, efficient, and insightful.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              In today's fast-paced educational environment, teachers need tools
              that save time and provide valuable data. Our mission is to
              eliminate the hassle of manual attendance tracking and provide
              educators with powerful, AI-driven analytics to better understand
              student engagement and presence.
            </p>
            <p>
              With features like instant face recognition and automated anomaly
              detection, AttendEase transforms a routine task into an
              opportunity for insight.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" /> Data Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This application is currently running on sample data for demonstration purposes. All classes, students, and attendance records are loaded from mock data files and stored in your browser's local storage.
            </p>
            <p>
                The initial data is sourced from <code className="font-mono bg-muted/50 p-1 rounded-md text-sm">src/lib/data.ts</code>. Any changes you make (like adding a class or student) are saved only in your browser and will not affect other users.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Features</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                Seamless Registration
              </h3>
              <p>
                Quickly register students and create classes. Capture student
                photos for face recognition with a single click.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                AI-Powered Face Scan
              </h3>
              <p>
                Take attendance for the entire class in seconds. Our AI
                accurately recognizes registered students from a live camera
                feed.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                Insightful Reporting
              </h3>
              <p>
                Track attendance records over time. Filter by class, date, and
                month to see the complete picture.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                Advanced Analytics
              </h3>
              <p>
                Leverage the power of AI to generate attendance summaries and
                detect unusual patterns, helping you identify students who may
                need support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
