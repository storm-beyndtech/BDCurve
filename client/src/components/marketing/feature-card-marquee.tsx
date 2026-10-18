import React from "react";
import { LucideIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureCardItem {
  /**
   * Icon component (optional)
   */
  icon?: LucideIcon;
  /**
   * Main text or feature name
   */
  text: string;
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  /**
   * Color variant for icon background
   * @default "primary"
   */
  color?: "primary" | "accent";
}

export interface FeatureCardMarqueeProps {
  /**
   * Array of feature items to display
   */
  features: FeatureCardItem[];
  /**
   * Animation duration in seconds
   * @default 35
   */
  duration?: number;
  /**
   * Card style variant
   * @default "glass"
   */
  variant?: "glass" | "outline" | "solid";
  /**
   * Card size
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
}

export function FeatureCardMarquee({
  features,
  duration = 35,
  variant = "glass",
  size = "default",
}: FeatureCardMarqueeProps) {
  const variantStyles = {
    glass: "bg-glass-card border-glass backdrop-blur-xl",
    outline: "bg-background/50 border border-border",
    solid: "bg-card border border-border",
  };

  const sizeStyles = {
    sm: "p-3 gap-2",
    default: "p-4 gap-3",
    lg: "p-6 gap-4",
  };

  const iconSizeStyles = {
    sm: "w-8 h-8",
    default: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconStyles = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const textStyles = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  // Duplicate features array for seamless loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>

      {/* Marquee container */}
      <div className="flex gap-4 animate-marquee" style={{ animationDuration: `${duration}s` }}>
        {duplicatedFeatures.map((feature, index) => {
          const Icon = feature.icon || CheckCircle2;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center flex-shrink-0 rounded-xl transition-all",
                variantStyles[variant],
                sizeStyles[size]
              )}
            >
              <div
                className={cn(
                  "rounded-lg flex items-center justify-center flex-shrink-0",
                  iconSizeStyles[size],
                  feature.color === "accent"
                    ? "bg-accent-500/10"
                    : "bg-primary-500/10"
                )}
              >
                <Icon
                  className={cn(
                    iconStyles[size],
                    feature.color === "accent" ? "text-accent-600" : "text-primary-600"
                  )}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", textStyles[size])}>{feature.text}</p>
                {feature.subtitle && (
                  <p className={cn("text-muted-foreground mt-0.5",
                    size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs"
                  )}>
                    {feature.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact single-row marquee for support/help cards
 */
export function SupportCardMarquee({
  cards,
  duration = 30,
}: {
  cards: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string;
    color?: "primary" | "accent";
  }>;
  duration?: number;
}) {
  // Duplicate cards array for seamless loop
  const duplicatedCards = [...cards, ...cards, ...cards];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"/>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"/>

      {/* Marquee container */}
      <div className="flex gap-4 animate-marquee" style={{ animationDuration: `${duration}s` }}>
        {duplicatedCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] p-4 rounded-xl border border-border bg-glass-card backdrop-blur-xl hover:border-primary-500/50 transition-all group"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    card.color === "accent"
                      ? "bg-accent-500/10"
                      : "bg-primary-500/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      card.color === "accent" ? "text-accent-600" : "text-primary-600"
                    )}/>
                </div>
                <div>
                  <p className="font-medium text-sm">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


