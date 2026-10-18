import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /**
   * Icon component
   */
  icon?: LucideIcon;
  /**
   * Title
   */
  title: string;
  /**
   * Description
   */
  description: string;
  /**
   * Primary action
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "primary-purple" | "outline" | "glass";
  };
  /**
   * Secondary action
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Card variant (if wrapped in card)
   * @default undefined (no card wrapper)
   */
  variant?: "elevated" | "glass" | "default";
  /**
   * Size
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
}

const sizeMap = {
  sm: {
    icon: "w-12 h-12",
    iconSize: "h-6 w-6",
    title: "text-base",
    description: "text-sm",
    padding: "py-8",
  },
  default: {
    icon: "w-16 h-16",
    iconSize: "h-8 w-8",
    title: "text-lg",
    description: "text-sm",
    padding: "py-12",
  },
  lg: {
    icon: "w-20 h-20",
    iconSize: "h-10 w-10",
    title: "text-xl",
    description: "text-base",
    padding: "py-16",
  },
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  variant,
  size = "default",
}: EmptyStateProps) {
  const sizes = sizeMap[size];

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("text-center space-y-4", sizes.padding)}
    >
      {/* Icon */}
      <div className="flex justify-center">
        <div
          className={cn(
            "rounded-2xl bg-muted/50 flex items-center justify-center",
            sizes.icon
          )}
        >
          <Icon className={cn("text-muted-foreground", sizes.iconSize)}/>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className={cn("font-semibold", sizes.title)}>{title}</h3>
        <p className={cn("text-muted-foreground", sizes.description)}>
          {description}
        </p>
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {action && (
            <Button
              variant={action.variant || "primary-purple"}
              size={size === "sm" ? "default" : "lg"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === "sm" ? "default" : "lg"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );

  if (variant) {
    return (
      <Card variant={variant} padding="lg">
        {content}
      </Card>
    );
  }

  return content;
}

/**
 * Inline empty state for small sections
 */
export function EmptyStateInline({
  icon: Icon = Inbox,
  title,
  description,
}: Pick<EmptyStateProps, "icon" | "title" | "description">) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground"/>
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

/**
 * Empty state for lists/tables
 */
export function EmptyStateList({
  icon: Icon = Inbox,
  title,
  action,
}: Pick<EmptyStateProps, "icon" | "title" | "action">) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
      <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="h-7 w-7 text-muted-foreground"/>
      </div>
      <p className="text-sm font-medium mb-4">{title}</p>
      {action && (
        <Button
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}


