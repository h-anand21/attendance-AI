
"use client";

import React, { useEffect } from "react";
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
  User,
  Settings,
  HelpCircle,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
  DesktopSidebar,
  MobileSidebar,
  SidebarProvider,
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
import { Separator } from "./ui/separator";

const Logo = () => {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-3 px-3">
        <AppLogo className="h-10 w-10" />
        <div className="flex flex-col">
            <p className="font-semibold text-lg text-sidebar-foreground">AttendEase</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <ChevronsUpDown className="h-4 w-4 ml-auto text-muted-foreground" />
    </div>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center justify-center py-1 text-sm font-normal"
    >
      <AppLogo className="h-8 w-8" />
    </Link>
  );
};

function AppSidebar() {
  const pathname = usePathname();
  const { user, userRole, signOut } = useAuth();
  const { open } = useSidebar();

  const mainLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Home className="h-5 w-5 shrink-0" />
      ),
      active: pathname === "/dashboard",
      visible: true,
    },
    {
      label: "Attendance",
      href: "/attendance",
      icon: (
        <ClipboardCheck className="h-5 w-5 shrink-0" />
      ),
      active: pathname.startsWith("/attendance"),
      visible: true,
    },
    {
      label: "Student Directory",
      href: "/registration/details",
      icon: (
        <Users className="h-5 w-5 shrink-0" />
      ),
      active: pathname.startsWith("/registration/details"),
      visible: userRole === 'admin',
    },
    {
        label: "Teacher Directory",
        href: "/registration/teacher",
        icon: (
            <UserPlus className="h-5 w-5 shrink-0" />
        ),
        active: pathname.startsWith("/registration/teacher"),
        visible: userRole === 'admin',
    },
    {
      label: "Reports",
      href: "/reports",
      icon: (
        <LineChart className="h-5 w-5 shrink-0" />
      ),
      active: pathname.startsWith("/reports"),
      visible: userRole === 'admin',
    },
  ];

  const bottomLinks = [
     {
      label: "About",
      href: "/about",
      icon: (
        <Info className="h-5 w-5 shrink-0" />
      ),
      active: pathname === "/about",
      visible: true,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="h-5 w-5 shrink-0" />,
      active: false,
      visible: true,
    },
  ]

  return (
    <Sidebar>
      <DesktopSidebar className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-2">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-1 px-3">
                {mainLinks.filter(l => l.visible).map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                ))}
            </div>
        </div>
        <div className="flex flex-col gap-1 px-3 pb-2">
          {bottomLinks.filter(l => l.visible).map((link, idx) => (
              <SidebarLink key={idx} link={link} />
          ))}
          <Separator className="my-2 bg-sidebar-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="w-full cursor-pointer">
                    <SidebarLink
                      link={{
                        label: user?.displayName || "User",
                        href: "#",
                        icon: (
                           <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user?.photoURL || undefined} alt="Avatar" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
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
      </DesktopSidebar>
      <MobileSidebar>
         <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-2">
                <Logo />
                <div className="mt-8 flex flex-col gap-1 px-3">
                    {mainLinks.filter(l => l.visible).map((link, idx) => (
                        <SidebarLink key={idx} link={link} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-1 px-3 pb-2">
            {bottomLinks.filter(l => l.visible).map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
            <Separator className="my-2 bg-sidebar-border" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="w-full cursor-pointer">
                        <SidebarLink
                          link={{
                            label: user?.displayName || "User",
                            href: "#",
                            icon: (
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={user?.photoURL || undefined} alt="Avatar" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
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
      </MobileSidebar>
    </Sidebar>
  );
}


function Header({ pageTitle }: { pageTitle: string }) {
  const { open, setOpen } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="md:hidden">
         <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
          <AppSidebar />
          <div className="flex flex-1 flex-col sm:gap-4 sm:py-4">
              <Header pageTitle={pageTitle} />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                  {children}
              </main>
          </div>
      </div>
    </SidebarProvider>
  );
}
