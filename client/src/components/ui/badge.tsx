import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default badge
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",

        // Secondary badge
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

        // Accent badge (Purple for dashboard)
        accent:
          "border-transparent bg-accent/10 text-accent hover:bg-accent/20",

        // Success badge (Green)
        success:
          "border-transparent bg-primary-500/10 text-primary-600 hover:bg-primary-500/20",

        // Warning badge
        warning:
          "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20",

        // Destructive badge
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",

        // Outline badge
        outline: "text-foreground border-border hover:bg-accent/10",

        // Glass badge (translucent)
        glass:
          "bg-glass border-glass shadow-glass backdrop-blur-xl hover:bg-glass-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}/>
  );
}

export { Badge, badgeVariants };


