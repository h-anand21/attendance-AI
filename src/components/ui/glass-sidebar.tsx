
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

  const link = (
    <Link
      href={href}
      className={cn(
        'group relative flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 select-none cursor-pointer',
        isActive
          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/40 dark:border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
          : 'text-slate-700 hover:bg-slate-300/60 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
      )}
    >
      {isActive && (
        <span className="absolute -left-3 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-r-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
      )}
      <span className={cn('transition-colors shrink-0', isActive ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white')}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );

  if (isMobile) {
    return <SheetClose asChild>{link}</SheetClose>;
  }

  return link;
}

export function GlassSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { userRole, user, signOut } = useAuth();
  const effectiveRole = userRole || (typeof window !== 'undefined' ? (localStorage.getItem('attendease_user_role') as 'admin' | 'teacher' | null) : null);

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
      visible: true,
    },
    {
      label: 'Teacher Directory',
      href: '/registration/teacher',
      icon: <User className="h-5 w-5" />,
      visible: effectiveRole === 'admin',
    },
    {
      label: 'Reports',
      href: effectiveRole === 'teacher' ? '/reports/teacher' : '/reports',
      icon: <LineChart className="h-5 w-5" />,
      visible: true,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-slate-300/80 dark:border-white/10 bg-slate-200/75 dark:bg-[#0B0F19]/90 p-4 backdrop-blur-xl transition-colors duration-200">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <AppLogo className="h-8 w-8 text-amber-500 dark:text-amber-400" />
        <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">AttendEase</span>
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
                <div className="mt-2 w-full cursor-pointer rounded-lg px-2 py-3 text-slate-700 dark:text-foreground/80 transition-colors hover:bg-slate-300/60 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-foreground">
                <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-white/10">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback className="bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{user?.displayName || 'Himanshu'}</span>
                    <span className="text-xs text-slate-500 dark:text-muted-foreground truncate">{user?.email}</span>
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
