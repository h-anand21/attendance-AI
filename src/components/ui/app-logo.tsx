
import Image from 'next/image';
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl", className)}>
      <Image
        src="/logo.png"
        alt="AttendEase Logo"
        width={80}
        height={80}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
