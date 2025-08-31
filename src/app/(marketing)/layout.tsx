
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, University } from 'lucide-react';
import { AppLogo } from '@/components/ui/app-logo';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-6 w-6 text-primary" />
            <span className="font-bold">AttendEase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign Up</Link>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4 border-b">
                   <Link href="/" className="flex items-center gap-2">
                     <AppLogo className="h-6 w-6 text-primary" />
                     <span className="font-bold">AttendEase</span>
                   </Link>
                </div>
                <nav className="flex-grow grid gap-4 p-4 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                 <div className="p-4 border-t">
                    <Button variant="ghost" asChild className='w-full justify-start mb-2'>
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild className='w-full'>
                      <Link href="/login">Sign Up</Link>
                    </Button>
                  </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div className="col-span-2 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-4">
                <AppLogo className="h-6 w-6 text-primary" />
                <span className="font-bold">AttendEase</span>
              </Link>
            <p className="text-sm text-muted-foreground">Simplify attendance tracking with AI.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <div className="grid gap-2 text-sm">
              <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
             <div className="grid gap-2 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground">Contact Us</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow Us</h4>
            <div className="grid gap-2 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground">Twitter</Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">LinkedIn</Link>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
           <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} AttendEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
