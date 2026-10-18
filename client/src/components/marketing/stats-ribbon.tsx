import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  /**
   * Stat label
   */
  label: string;
  /**
   * Stat value (e.g., "$2.4B+", "10,000+", "99.9%")
   */
  value: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional icon
   */
  icon?: LucideIcon;
  /**
   * Optional color variant
   */
  color?: "primary" | "accent" | "default";
}

export interface StatsRibbonProps {
  /**
   * Array of stats to display
   */
  stats: StatItem[];
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Card variant
   * @default "glass"
   */
  variant?: "glass" | "solid" | "minimal";
  /**
   * Layout columns
   * @default 3
   */
  columns?: 2 | 3 | 4;
  /**
   * Enable animations
   * @default true
   */
  animated?: boolean;
}

export function StatsRibbon({
  stats,
  title,
  description,
  variant = "glass",
  columns = 3,
  animated = true,
}: StatsRibbonProps) {
  const gridColsClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const variantStyles = {
    glass: "bg-glass-card border-glass shadow-glass",
    solid: "bg-card border border-border shadow-depth",
    minimal: "bg-transparent border-none",
  };

  return (
    <section className="section-spacing-md bg-ambient-marketing-section w-full">
      <div className="container-wide container-padding">
        {/* Header */}
        {(title || description) && (
          <motion.div
            className="text-center mb-12"
            initial={animated ? { opacity: 0, y: 20 } : false}
            whileInView={animated ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className={cn("grid gap-6", gridColsClass)}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = {
              primary: "text-primary-600 bg-primary-500/10",
              accent: "text-accent-600 bg-accent-500/10",
              default: "text-foreground/70 bg-foreground/5",
            }[stat.color || "default"];

            return (
              <motion.div
                key={index}
                className={cn(
                  "flex flex-col items-center text-center p-6 rounded-xl backdrop-blur-xl",
                  variantStyles[variant]
                )}
                initial={animated ? { opacity: 0, y: 20 } : false}
                whileInView={animated ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: animated ? index * 0.1 : 0,
                }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                {/* Icon */}
                {Icon && (
                  <div className="mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        colorClass
                      )}
                    >
                      <Icon className="h-6 w-6"/>
                    </div>
                  </div>
                )}

                {/* Value */}
                <p className="text-3xl font-bold mb-1">{stat.value}</p>

                {/* Label */}
                <p className="text-sm font-semibold text-foreground/80 mb-1">
                  {stat.label}
                </p>

                {/* Description */}
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Compact inline stats without section wrapper
 */
export function StatsRibbonCompact({ stats, columns = 3 }: StatsRibbonProps) {
  const gridColsClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4", gridColsClass)}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="text-center p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="text-3xl font-bold tracking-tight mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}


