import React from "react";
import { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";

export interface StatGridItem {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
}

export interface StatGridProps {
  items: StatGridItem[];
  /**
   * Tailwind grid template, e.g., "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
   */
  columns?: string;
  className?: string;
}

export function StatGrid({
  items,
  columns = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  className,
}: StatGridProps) {
  return (
    <div className={cn("grid gap-4", columns, className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <StatCard icon={item.icon} label={item.label} value={item.value}/>
          {item.description ? (
            <p className="text-xs text-muted-foreground leading-snug">{item.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}


