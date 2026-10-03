'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-slate-200/80 dark:bg-white/10 backdrop-blur-md border border-slate-300 dark:border-white/20 text-slate-800 dark:text-foreground hover:bg-slate-300/80 dark:hover:bg-white/20 shadow-xs",
        primary: "bg-amber-500/20 dark:bg-primary/20 backdrop-blur-md border border-amber-500/40 dark:border-primary/30 text-amber-900 dark:text-primary hover:bg-amber-500/30 dark:hover:bg-primary/30 font-semibold shadow-xs",
        outline: "bg-slate-100/60 dark:bg-transparent border border-slate-300 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/5 text-slate-800 dark:text-foreground shadow-xs",
        ghost: "hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-800 dark:text-foreground",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }