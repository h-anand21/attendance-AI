
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LogOut,
  LineChart,
  ClipboardCheck,
  Users,
  Settings,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { AppLogo } from './app-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { SheetClose } from './sheet';

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  isMobile?: boolean;
};

function SidebarLink({ href, label, icon, isMobile = false }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const LinkContent = () => (
    <div
      className={cn(
        'group relative flex cursor-pointer items-center rounded-lg text-foreground/80 transition-all duration-300',
        isActive && 'text-foreground font-semibold'
      )}
    >
      <span className="absolute -z-10 h-full w-full rounded-lg bg-white/5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-20" />
      <span className="absolute -z-10 h-full w-full rounded-lg bg-white/5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-40" />
      <div
        className={cn(
          'flex w-full items-center gap-4 rounded-lg p-0 transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:bg-white/10 group-hover:shadow-lg',
          isActive ? 'bg-white/10' : 'bg-transparent'
        )}
      >
        <div className="relative flex w-full items-center gap-4 p-3">
           {isActive && (
            <div className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_10px] shadow-primary" />
          )}
          {icon}
          <span>{label}</span>
        </div>
      </div>
    </div>
  );

  const Wrapper = isMobile ? SheetClose : React.Fragment;
  const wrapperProps = isMobile ? { asChild: true } : {};

  return (
    <Wrapper {...wrapperProps}>
      <Link href={href}>
        <LinkContent />
      </Link>
    </Wrapper>
  );
}

export function GlassSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { userRole, user, signOut } = useAuth();

  const mainLinks = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      visible: true,
    },
    {
      label: 'Attendance',
      href: '/attendance',
      icon: <ClipboardCheck className="h-5 w-5" />,
      visible: true,
    },
    {
      label: 'Meal Verification',
      href: '/meal-verification',
      icon: <UtensilsCrossed className="h-5 w-5" />,
      visible: true,
    },
    {
      label: 'Student Directory',
      href: '/registration/details',
      icon: <Users className="h-5 w-5" />,
      visible: userRole === 'admin',
    },
    {
      label: 'Teacher Directory',
      href: '/registration/teacher',
      icon: <User className="h-5 w-5" />,
      visible: userRole === 'admin',
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: <LineChart className="h-5 w-5" />,
      visible: userRole === 'admin',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-52 flex-col border-r border-white/10 bg-white/5 p-4 pr-6 backdrop-blur-sm">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <AppLogo className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">AttendEase</span>
      </Link>

      <nav className="flex-1 space-y-2">
        {mainLinks.filter(l => l.visible).map((link) => (
          <SidebarLink key={link.href} {...link} isMobile={isMobile} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center">
        
        <div className="w-full mt-4">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="mt-2 w-full cursor-pointer rounded-lg px-2 py-3 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground">
                <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{user?.displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 mb-2" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
