import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        // Primary CTA (keep solid fill)
        primary:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 active:translate-y-px",

        // Dashboard accent CTA
        "primary-purple":
          "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-sm hover:from-accent-600 hover:to-accent-700 active:translate-y-px",

        // Outline variant for lightweight actions
        outline:
          "border border-border/70 bg-transparent text-foreground hover:bg-accent/5 hover:border-foreground/40 active:translate-y-px shadow-none",

        // Subtle variant (muted fill)
        subtle:
          "bg-accent/10 text-accent-foreground hover:bg-accent/20 border border-accent/30 active:translate-y-px shadow-none",

        // Ghost variant
        ghost:
          "text-foreground hover:bg-muted/50 active:translate-y-px shadow-none",

        // Glass variant (Apple-style translucent)
        glass:
          "bg-glass border border-glass shadow-glass backdrop-blur-xl hover:bg-glass-hover hover:border-glass-strong active:translate-y-px",

        // Gradient variant (Custom gradients)
        gradient:
          "bg-gradient-to-r from-accent-500 via-primary-500 to-accent-600 text-white shadow-depth-md hover:shadow-depth-lg active:translate-y-px",

        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:translate-y-px",

        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-sm",
        xl: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}/>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
