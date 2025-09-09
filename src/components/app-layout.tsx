
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarUser,
  useSidebar,
  DesktopSidebar,
  MobileSidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AppLogo } from "./ui/app-logo";
import { ThemeToggle } from "./theme-toggle";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { GlassSidebar } from "./ui/glass-sidebar";


function Header({ pageTitle }: { pageTitle: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-background/50 px-4 backdrop-blur-sm sm:px-6 md:pl-72">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-transparent hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r-0 bg-transparent p-0">
            <GlassSidebar isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>
      <h1 className="flex-1 text-2xl font-semibold">{pageTitle}</h1>
       <ThemeToggle />
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </header>
  );
}

export function AppLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex min-h-screen w-full flex-col bg-background/95">
          <div className="hidden md:block">
            <GlassSidebar />
          </div>
          <div className="flex flex-1 flex-col md:pl-72">
              <Header pageTitle={pageTitle} />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                   >
                     {children}
                   </motion.div>
              </main>
          </div>
      </div>
  );
}
