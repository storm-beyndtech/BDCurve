import React from "react";
import { motion } from "framer-motion";
import { MoreVertical, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ResourceItem {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Primary label/title
   */
  label: string;
  /**
   * Secondary description
   */
  description?: string;
  /**
   * Icon component
   */
  icon?: LucideIcon;
  /**
   * Icon URL (alternative to icon component)
   */
  iconUrl?: string;
  /**
   * Badge/status
   */
  badge?: {
    label: string;
    variant?: "default" | "glass" | "secondary" | "accent" | "success" | "warning" | "destructive" | "outline";
  };
  /**
   * Metadata items (e.g., amount, date)
   */
  metadata?: {
    label: string;
    value: string;
  }[];
  /**
   * Optional action handler
   */
  onAction?: () => void;
  /**
   * Click handler for the entire row
   */
  onClick?: () => void;
}

export interface ResourceListProps {
  /**
   * List of resources
   */
  items: ResourceItem[];
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
  /**
   * Show dividers between items
   * @default true
   */
  showDividers?: boolean;
  /**
   * Max height before scrolling
   */
  maxHeight?: string;
  /**
   * Empty state component
   */
  emptyState?: React.ReactNode;
}

export function ResourceList({
  items,
  variant = "elevated",
  showDividers = true,
  maxHeight,
  emptyState,
}: ResourceListProps) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Card variant={variant} padding="none">
      <div
        className={cn("divide-y divide-border", maxHeight && "overflow-y-auto")}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-4 transition-colors",
                item.onClick && "cursor-pointer hover:bg-accent/5",
                !showDividers && index !== items.length - 1 && "border-b-0"
              )}
              onClick={item.onClick}
            >
              {/* Icon */}
              {(Icon || item.iconUrl) && (
                <div className="flex-shrink-0">
                  {Icon ? (
                    <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-accent-600"/>
                    </div>
                  ) : item.iconUrl ? (
                    <img
                      src={item.iconUrl}
                      alt={item.label}
                      className="w-10 h-10 rounded-lg object-cover"/>
                  ) : null}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.badge && (
                    <Badge variant={item.badge.variant || "default"} className="text-xs">
                      {item.badge.label}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}

                {/* Metadata */}
                {item.metadata && item.metadata.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    {item.metadata.map((meta, metaIndex) => (
                      <div key={metaIndex} className="text-xs">
                        <span className="text-muted-foreground">{meta.label}: </span>
                        <span className="font-medium">{meta.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {item.onAction && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onAction?.();
                  }}
                  className="flex-shrink-0 p-2 hover:bg-accent/5 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground"/>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

/**
 * Compact resource list without card wrapper
 */
export function ResourceListCompact({
  items,
  showDividers = false,
}: Pick<ResourceListProps, "items" | "showDividers">) {
  return (
    <div className={cn("space-y-2", showDividers && "divide-y divide-border")}>
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors",
              item.onClick && "cursor-pointer hover:bg-accent/5"
            )}
            onClick={item.onClick}
          >
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-accent-600"/>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              )}
            </div>
            {item.badge && (
              <Badge variant={item.badge.variant || "default"} className="text-xs flex-shrink-0">
                {item.badge.label}
              </Badge>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}


