import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Activity type
   */
  type: "transaction" | "card" | "account" | "user" | "system";
  /**
   * Activity title/description
   */
  title: string;
  /**
   * Additional details
   */
  details?: string;
  /**
   * Timestamp (relative, e.g., "2 hours ago")
   */
  timestamp: string;
  /**
   * Icon component
   */
  icon?: LucideIcon;
  /**
   * Status badge
   */
  badge?: {
    label: string;
    variant?: "default" | "glass" | "secondary" | "accent" | "success" | "warning" | "destructive" | "outline";
  };
  /**
   * Amount (for transactions)
   */
  amount?: string;
  /**
   * Amount direction
   */
  amountDirection?: "in" | "out";
}

export interface ActivityFeedProps {
  /**
   * List of activities
   */
  activities: ActivityItem[];
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
  /**
   * Max height before scrolling
   */
  maxHeight?: string;
  /**
   * Show timeline connector
   * @default true
   */
  showTimeline?: boolean;
  /**
   * Empty state component
   */
  emptyState?: React.ReactNode;
}

const typeColors = {
  transaction: "bg-accent-500/10 text-accent-600",
  card: "bg-primary-500/10 text-primary-600",
  account: "bg-blue-500/10 text-blue-600",
  user: "bg-purple-500/10 text-purple-600",
  system: "bg-gray-500/10 text-gray-600",
};

export function ActivityFeed({
  activities,
  variant = "elevated",
  maxHeight,
  showTimeline = true,
  emptyState,
}: ActivityFeedProps) {
  if (activities.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Card variant={variant} padding="lg">
      <div
        className={cn("space-y-4", maxHeight && "overflow-y-auto")}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {activities.map((activity, index) => {
          const Icon = activity.icon || Clock;
          const isLast = index === activities.length - 1;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative flex gap-3"
            >
              {/* Timeline */}
              {showTimeline && (
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10",
                      typeColors[activity.type]
                    )}
                  >
                    <Icon className="h-4 w-4"/>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="w-px flex-1 bg-border mt-2"/>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.badge && (
                        <Badge
                          variant={activity.badge.variant || "default"}
                          className="text-xs"
                        >
                          {activity.badge.label}
                        </Badge>
                      )}
                    </div>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  {activity.amount && (
                    <div className="text-right flex-shrink-0">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          activity.amountDirection === "in"
                            ? "text-green-600"
                            : "text-foreground"
                        )}
                      >
                        {activity.amountDirection === "in" ? "+" : "-"}
                        {activity.amount}
                      </p>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3"/>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * Compact activity feed without card wrapper
 */
export function ActivityFeedCompact({
  activities,
  showTimeline = false,
}: Pick<ActivityFeedProps, "activities" | "showTimeline">) {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activity.icon || Clock;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors"
          >
            {showTimeline && (
              <div
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                  typeColors[activity.type]
                )}
              >
                <Icon className="h-3 w-3"/>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
            {activity.amount && (
              <span
                className={cn(
                  "text-xs font-semibold flex-shrink-0",
                  activity.amountDirection === "in"
                    ? "text-green-600"
                    : "text-foreground"
                )}
              >
                {activity.amountDirection === "in" ? "+" : "-"}
                {activity.amount}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}


