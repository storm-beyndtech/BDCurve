import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        // Default chip
        default:
          "border-border bg-background hover:bg-accent/10 active:scale-95",

        // Primary chip (Green for marketing)
        primary:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95",

        // Accent chip (Purple for dashboard)
        accent:
          "border-accent/20 bg-accent/10 text-accent hover:bg-accent/20 active:scale-95",

        // Glass chip (translucent)
        glass:
          "bg-glass border-glass shadow-glass backdrop-blur-xl hover:bg-glass-hover active:scale-95",

        // Outline chip
        outline:
          "border-border bg-transparent hover:bg-accent/10 active:scale-95",

        // Success chip
        success:
          "border-primary-500/20 bg-primary-500/10 text-primary-600 hover:bg-primary-500/20 active:scale-95",
      },
      size: {
        sm: "h-6 px-2 text-xs",
        default: "h-7 px-3 text-sm",
        lg: "h-8 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, onRemove, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors p-0.5"
            aria-label="Remove"
          >
            <X className="h-3 w-3"/>
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";

export { Chip, chipVariants };


