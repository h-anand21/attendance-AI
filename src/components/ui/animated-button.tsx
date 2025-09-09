
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ScanFace } from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-yellow-900/80 px-6 font-medium text-yellow-50 transition-transform duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
          'before:absolute before:inset-0 before:z-0 before:rounded-full before:bg-yellow-800/50 before:shadow-[inset_0_0.5px_hsl(48,100%,80%),inset_0_-1px_2px_0_hsl(48,100%,20%),0px_4px_10px_-4px_hsla(0,0%,0%)] before:transition-all before:duration-300 group-hover:before:scale-110',
          'after:absolute after:inset-0 after:z-0 after:rounded-full after:bg-[radial-gradient(at_51%_89%,hsla(48,96%,57%,0.6)_0px,transparent_50%),radial-gradient(at_100%_100%,hsla(48,96%,57%,0.8)_0px,transparent_50%),radial-gradient(at_22%_91%,hsla(48,96%,57%,0.7)_0px,transparent_50%)] after:opacity-0 after:transition-opacity after:duration-300 group-hover:after:opacity-100',
          className
        )}
        {...props}
      >
        {/* Rotating dots border */}
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden rounded-full">
          <div className="absolute left-1/2 top-1/2 h-[200%] w-full -translate-x-1/2 -translate-y-1/2 animate-border-spin bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(48,96%,57%)_360deg)] group-hover:opacity-100" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
            {children}
        </div>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';


// Sparkle Icon Component to be used with the button
export const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-7 w-7">
        <g>
        <path
            className="fill-white stroke-white transition-all duration-500 group-hover:animate-sparkle-path-1"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.187 8.096L15 5.25l.813 2.846c.21.735.604 1.405 1.145 1.945s1.21 1.054 1.945 1.145L21.75 12l-2.846.813a3.99 3.99 0 01-1.945 1.145 3.99 3.99 0 01-1.145 1.945L15 18.75l-.813-2.846a3.99 3.99 0 01-1.145-1.945 3.99 3.99 0 01-1.945-1.145L8.25 12l2.846-.813a3.99 3.99 0 011.945-1.145c.735-.21 1.405-.604 1.945-1.145z"
        ></path>
        <path
            className="fill-white stroke-white transition-all duration-500 group-hover:animate-sparkle-path-2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 14.25L5.74 15.285c-.15.593-.456 1.135-.89 1.568-.433.433-.975.74-1.568.89L2.25 18l1.035.259c.593.148 1.135.457 1.568.89.433.433.74.975.89 1.568L6 21.75l.259-1.035c.148-.593.457-1.135.89-1.568.433-.433.975-.74 1.568-.89L9.75 18l-1.036-.259a2.76 2.76 0 01-1.568-.89c-.433-.433-.74-.975-.89-1.568L6 14.25z"
        ></path>
        <path
            className="fill-white stroke-white transition-all duration-500 group-hover:animate-sparkle-path-3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.5 4L6.303 4.591c-.055.166-.148.316-.271.44-.124.123-.274.216-.44.27L5 5.5l.592.197c.165.055.315.148.44.271.123.124.216.274.27.44L6.5 7l.197-.592c.055-.166.148-.316.271-.44.124-.124.274-.217.44-.271L8 5.5l-.592-.197a1.002 1.002 0 00-.44-.271A1 1 0 006.697 4.59L6.5 4z"
        ></path>
        </g>
    </svg>
);
