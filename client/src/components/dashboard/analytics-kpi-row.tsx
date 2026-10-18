import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KPIData {
  /**
   * KPI label
   */
  label: string;
  /**
   * Current value
   */
  value: string;
  /**
   * Previous period value for comparison
   */
  previousValue?: string;
  /**
   * Percentage change
   */
  change?: number;
  /**
   * Change direction
   */
  trend?: "up" | "down" | "neutral";
  /**
   * Icon
   */
  icon?: LucideIcon;
  /**
   * Description or additional context
   */
  description?: string;
  /**
   * Color theme
   */
  color?: "accent" | "primary" | "success" | "warning";
}

export interface AnalyticsKPIRowProps {
  /**
   * Array of KPI data
   */
  kpis: KPIData[];
  /**
   * Number of columns
   * @default 4
   */
  columns?: 2 | 3 | 4 | 5;
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
}

const colorMap = {
  accent: {
    bg: "bg-accent-500/10",
    text: "text-accent-600",
    trend: "text-accent-600",
  },
  primary: {
    bg: "bg-primary-500/10",
    text: "text-primary-600",
    trend: "text-primary-600",
  },
  success: {
    bg: "bg-green-500/10",
    text: "text-green-600",
    trend: "text-green-600",
  },
  warning: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600",
    trend: "text-yellow-600",
  },
};

export function AnalyticsKPIRow({
  kpis,
  columns = 4,
  variant = "elevated",
}: AnalyticsKPIRowProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns])}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const colors = colorMap[kpi.color || "accent"];
        const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card variant={variant} padding="lg" hover="lift">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {kpi.value}
                    </p>
                  </div>
                  {Icon && (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        colors.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", colors.text)}/>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {kpi.description && (
                    <p className="text-xs text-muted-foreground">
                      {kpi.description}
                    </p>
                  )}

                  {kpi.change !== undefined && kpi.trend && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        kpi.trend === "up"
                          ? "text-green-600"
                          : kpi.trend === "down"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      )}
                    >
                      {kpi.trend !== "neutral" && (
                        <TrendIcon className="h-3 w-3"/>
                      )}
                      <span>
                        {kpi.change > 0 ? "+" : ""}
                        {kpi.change}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar (optional) */}
                {kpi.previousValue && (
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.abs(kpi.change || 0)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                      className={cn(
                        "h-full rounded-full",
                        kpi.trend === "up"
                          ? "bg-green-500"
                          : kpi.trend === "down"
                          ? "bg-red-500"
                          : "bg-accent-500"
                      )}/>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Compact KPI row for sidebars or embedded views
 */
export function AnalyticsKPIRowCompact({ kpis }: { kpis: KPIData[] }) {
  return (
    <div className="space-y-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const colors = colorMap[kpi.color || "accent"];

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                  <Icon className={cn("h-4 w-4", colors.text)}/>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-lg font-semibold">{kpi.value}</p>
              </div>
            </div>
            {kpi.change !== undefined && (
              <span
                className={cn(
                  "text-xs font-medium",
                  kpi.trend === "up"
                    ? "text-green-600"
                    : kpi.trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
                )}
              >
                {kpi.change > 0 ? "+" : ""}
                {kpi.change}%
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}


