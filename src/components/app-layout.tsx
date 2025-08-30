"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Download, Home, ScanFace, Users, UserPlus } from "lucide-react";
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

function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="justify-center">
        <div className="flex items-center gap-2">
          <ScanFace className="h-8 w-8 text-primary" />
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
              isActive={pathname === "/"}
              tooltip={{ children: "Dashboard" }}
            >
              <Link href="/">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/attendance")}
              tooltip={{ children: "Attendance" }}
            >
              <Link href="/">
                <Users />
                <span>Attendance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/reports"}
              tooltip={{ children: "Reports" }}
            >
              <Link href="/reports">
                <Download />
                <span>Reports</span>
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
                    src="https://picsum.photos/seed/teacher/40/40"
                    alt="Teacher"
                    data-ai-hint="person"
                  />
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <span className="truncate">Teacher</span>
              </SidebarMenuButton>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Teacher</p>
                <p className="text-xs leading-none text-muted-foreground">
                  teacher@school.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Header({ pageTitle }: { pageTitle: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
      <SidebarTrigger />
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
