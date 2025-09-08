
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Home,
  UserPlus,
  LogOut,
  Info,
  LineChart,
  ClipboardCheck,
  Users,
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { AppLogo } from "./ui/app-logo";
import { ThemeToggle } from "./theme-toggle";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <AppLogo className="h-6 w-6" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white text-lg"
      >
        AttendEase
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <AppLogo className="h-6 w-6" />
    </Link>
  );
};

function AppSidebar() {
  const pathname = usePathname();
  const { user, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Home className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      active: pathname === "/dashboard",
      visible: true,
    },
    {
      label: "Attendance",
      href: "/attendance",
      icon: (
        <ClipboardCheck className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      active: pathname.startsWith("/attendance"),
      visible: true,
    },
    {
      label: "Student Directory",
      href: "/registration/details",
      icon: (
        <Users className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      active: pathname.startsWith("/registration/details"),
      visible: userRole === 'admin',
    },
    {
        label: "Teacher Directory",
        href: "/registration/teacher",
        icon: (
            <UserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
        active: pathname.startsWith("/registration/teacher"),
        visible: userRole === 'admin',
    },
    {
      label: "Reports",
      href: "/reports",
      icon: (
        <LineChart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      active: pathname.startsWith("/reports"),
      visible: userRole === 'admin',
    },
    {
      label: "About",
      href: "/about",
      icon: (
        <Info className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      active: pathname === "/about",
      visible: true,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
                {links.filter(l => l.visible).map((link, idx) => (
                    <SidebarLink key={idx} link={link} className={cn(link.active && "bg-neutral-200 dark:bg-neutral-700")} />
                ))}
            </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="w-full cursor-pointer">
                    <SidebarLink
                    link={{
                        label: user?.displayName || "User",
                        href: "#",
                        icon: (
                        <img
                            src={user?.photoURL || "https://picsum.photos/seed/user/40/40"}
                            className="h-7 w-7 shrink-0 rounded-full"
                            width={50}
                            height={50}
                            alt="Avatar"
                        />
                        ),
                    }}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {user?.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}


function Header({ pageTitle }: { pageTitle: string }) {
  // useSidebar hook is not available here, so we manage mobile menu state separately
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="md:hidden">
         {/* This button will only be visible on mobile and will be handled by the MobileSidebar component */}
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
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
        <AppSidebar />
        <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
            <Header pageTitle={pageTitle} />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                {children}
            </main>
        </div>
    </div>
  );
}
