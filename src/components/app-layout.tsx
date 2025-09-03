
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
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
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
import { useClasses } from "@/hooks/use-classes";
import { Loader2 } from "lucide-react";
import { AppLogo } from "./ui/app-logo";

function AppSidebar() {
  const pathname = usePathname();
  const { user, userRole, signOut } = useAuth();
  const { classes } = useClasses();
  const [isReportsOpen, setIsReportsOpen] = React.useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = React.useState(false);

  useEffect(() => {
    if (pathname.startsWith('/reports')) {
      setIsReportsOpen(true);
    }
    if (pathname.startsWith('/attendance')) {
      setIsAttendanceOpen(true);
    }
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="justify-center">
        <div className="flex items-center gap-2">
          <AppLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            AttendEase
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem asChild>
            <Collapsible open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
              <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/attendance")}
                    tooltip={{ children: "Attendance" }}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCheck />
                      <span>Attendance</span>
                    </div>
                  </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <SidebarMenuSub>
                  {classes.map((cls) => (
                    <SidebarMenuSubButton 
                      key={cls.id} 
                      asChild 
                      isActive={pathname === `/attendance/${cls.id}`}
                    >
                        <Link href={`/attendance/${cls.id}`}>{cls.name}</Link>
                    </SidebarMenuSubButton>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          {userRole === 'admin' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/registration"}
                  tooltip={{ children: "Registration" }}
                >
                  <Link href="/registration">
                    <UserPlus />
                    <span>Registration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem asChild>
                <Collapsible open={isReportsOpen} onOpenChange={setIsReportsOpen}>
                  <CollapsibleTrigger asChild>
                     <SidebarMenuButton
                        isActive={pathname.startsWith("/reports")}
                        tooltip={{ children: "Reports" }}
                        className="justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <LineChart />
                          <span>Reports</span>
                        </div>
                      </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenuSub>
                        <SidebarMenuSubButton asChild isActive={pathname === '/reports'}>
                            <Link href="/reports">Attendance Reports</Link>
                        </SidebarMenuSubButton>
                         <SidebarMenuSubButton asChild isActive={pathname === '/reports/teacher'}>
                            <Link href="/reports/teacher">Teacher Reports</Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/about"}
              tooltip={{ children: "About" }}
            >
              <Link href="/about">
                <Info />
                <span>About</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-full">
              <SidebarMenuButton
                className="w-full"
                tooltip={{ children: "User Profile" }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photoURL || "https://picsum.photos/seed/user/40/40"}
                    alt={user?.displayName || "User"}
                    data-ai-hint="person"
                  />
                  <AvatarFallback>
                    {user?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user?.displayName || "User"}</span>
              </SidebarMenuButton>
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
      </SidebarFooter>
    </Sidebar>
  );
}

function Header({ pageTitle }: { pageTitle: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger className="md:hidden"/>
      <h1 className="flex-1 text-xl font-semibold">{pageTitle}</h1>
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
      <AppSidebar />
      <SidebarInset>
        <Header pageTitle={pageTitle} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
