import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const metricVariants = cva(
  "flex flex-col gap-1",
  {
    variants: {
      size: {
        sm: "gap-0.5",
        default: "gap-1",
        lg: "gap-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const metricValueVariants = cva(
  "font-semibold tracking-tight",
  {
    variants: {
      size: {
        sm: "text-2xl",
        default: "text-3xl",
        lg: "text-4xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const metricChangeVariants = cva(
  "inline-flex items-center gap-1 text-sm font-medium",
  {
    variants: {
      trend: {
        up: "text-primary-600 dark:text-primary-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-muted-foreground",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

export interface MetricProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricVariants> {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  prefix?: string;
  suffix?: string;
  description?: string;
}

const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  (
    {
      className,
      size,
      label,
      value,
      change,
      changeLabel,
      trend = "neutral",
      prefix,
      suffix,
      description,
      ...props
    },
    ref
  ) => {
    // Auto-determine trend from change value if not explicitly set
    const determinedTrend = trend !== "neutral"
      ? trend
      : change
        ? change > 0
          ? "up"
          : change < 0
            ? "down"
            : "neutral"
        : "neutral";

    const TrendIcon = determinedTrend === "up"
      ? ArrowUp
      : determinedTrend === "down"
        ? ArrowDown
        : Minus;

    return (
      <div
        ref={ref}
        className={cn(metricVariants({ size, className }))}
        {...props}
      >
        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <p className={cn(metricValueVariants({ size }))}>
            {prefix}
            {value}
            {suffix}
          </p>

          {/* Change indicator */}
          {change !== undefined && (
            <span className={cn(metricChangeVariants({ trend: determinedTrend }))}>
              <TrendIcon className="h-4 w-4"/>
              {Math.abs(change)}%
            </span>
          )}
        </div>

        {/* Change label or description */}
        {(changeLabel || description) && (
          <p className="text-xs text-muted-foreground">
            {changeLabel || description}
          </p>
        )}
      </div>
    );
  }
);
Metric.displayName = "Metric";

// Metric Card Wrapper (for dashboard/marketing stats)
export interface MetricCardProps extends MetricProps {
  icon?: React.ReactNode;
  variant?: "default" | "glass" | "elevated";
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, icon, variant = "default", ...metricProps }, ref) => {
    const cardClasses = cn(
      "rounded-xl p-6 transition-all duration-300",
      {
        "bg-card border border-border shadow-depth": variant === "default",
        "bg-glass-card border-glass shadow-glass backdrop-blur-xl": variant === "glass",
        "bg-card border border-border shadow-elevated hover:shadow-elevated-lg": variant === "elevated",
      },
      className
    );

    return (
      <div ref={ref} className={cardClasses}>
        {icon && (
          <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-2 text-accent">
            {icon}
          </div>
        )}
        <Metric {...metricProps}/>
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { Metric, MetricCard, metricVariants };


