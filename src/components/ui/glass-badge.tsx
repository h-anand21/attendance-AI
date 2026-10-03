import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-slate-300/80 dark:border-white/20 bg-slate-100/90 dark:bg-white/10 text-slate-800 dark:text-foreground hover:bg-slate-200/90 dark:hover:bg-white/20",
        primary:
          "border-amber-500/40 dark:border-primary/30 bg-amber-500/15 dark:bg-primary/20 text-amber-800 dark:text-primary hover:bg-amber-500/25 dark:hover:bg-primary/30 font-semibold",
        secondary:
          "border-slate-300/80 dark:border-secondary/30 bg-slate-100/90 dark:bg-secondary/20 text-slate-700 dark:text-secondary-foreground hover:bg-slate-200/90 dark:hover:bg-secondary/30",
        destructive:
          "border-destructive/30 bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline: "text-slate-800 dark:text-foreground border-slate-300/80 dark:border-white/10 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassBadgeVariants> {}

function GlassBadge({ className, variant, ...props }: GlassBadgeProps) {
  return (
    <div className={cn(glassBadgeVariants({ variant }), className)} {...props} />
  )
}

export { GlassBadge, glassBadgeVariants }