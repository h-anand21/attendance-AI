import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-white/20 bg-white/10 text-foreground hover:bg-white/20",
        primary:
          "border-primary/30 bg-primary/20 text-primary hover:bg-primary/30",
        secondary:
          "border-secondary/30 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
        destructive:
          "border-destructive/30 bg-destructive/20 text-destructive-foreground hover:bg-destructive/30",
        outline: "text-foreground border-white/10 bg-transparent",
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