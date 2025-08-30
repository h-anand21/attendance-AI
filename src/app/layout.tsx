import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/tooster';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'AttendEase',
  description: 'Smart Attendance System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <div className="relative min-h-screen w-full">
            <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
              <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(255,0,168,0.15)] opacity-50 blur-[80px]"></div>
            </div>
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
