import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OrbConfig {
  /**
   * Orb size (in pixels)
   */
  size: number;
  /**
   * Orb color (CSS color value)
   */
  color: string;
  /**
   * Initial position (percentage)
   */
  x: number;
  y: number;
  /**
   * Blur amount (in pixels)
   * @default 80
   */
  blur?: number;
  /**
   * Animation duration (in seconds)
   * @default 20
   */
  duration?: number;
  /**
   * Animation delay (in seconds)
   * @default 0
   */
  delay?: number;
}

export interface BlurOrbsProps {
  /**
   * Array of orb configurations
   */
  orbs?: OrbConfig[];
  /**
   * Opacity of orbs
   * @default 0.4
   */
  opacity?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Enable animation
   * @default true
   */
  animate?: boolean;
}

const defaultMarketingOrbs: OrbConfig[] = [
  {
    size: 600,
    color: "#3b82f6",
    x: 10,
    y: 20,
    blur: 120,
    duration: 25,
    delay: 0,
  },
  {
    size: 500,
    color: "#0ea5e9",
    x: 70,
    y: 60,
    blur: 100,
    duration: 30,
    delay: 2,
  },
  {
    size: 400,
    color: "#10b981",
    x: 50,
    y: 10,
    blur: 80,
    duration: 28,
    delay: 5,
  },
];

const defaultDashboardOrbs: OrbConfig[] = [
  {
    size: 600,
    color: "#a855f7",
    x: 15,
    y: 25,
    blur: 120,
    duration: 25,
    delay: 0,
  },
  {
    size: 500,
    color: "#9333ea",
    x: 75,
    y: 55,
    blur: 100,
    duration: 30,
    delay: 2,
  },
  {
    size: 450,
    color: "#7e22ce",
    x: 45,
    y: 15,
    blur: 90,
    duration: 28,
    delay: 4,
  },
];

export function BlurOrbs({
  orbs = defaultMarketingOrbs,
  opacity = 0.4,
  className,
  animate = true,
}: BlurOrbsProps) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    >
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur ?? 80}px)`,
            opacity,
            transform: "translate(-50%, -50%)",
          }}
          animate={
            animate
              ? {
                  x: [0, 50, -30, 0],
                  y: [0, -40, 30, 0],
                  scale: [1, 1.1, 0.95, 1],
                }
              : undefined
          }
          transition={{
            duration: orb.duration ?? 20,
            delay: orb.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}/>
      ))}
    </div>
  );
}

/**
 * Marketing-specific blur orbs (blue-based)
 */
export function MarketingBlurOrbs({
  opacity = 0.3,
  className,
}: Omit<BlurOrbsProps, "orbs">) {
  return (
    <BlurOrbs
      orbs={defaultMarketingOrbs}
      opacity={opacity}
      className={className}/>
  );
}

/**
 * Dashboard-specific blur orbs (purple-based)
 */
export function DashboardBlurOrbs({
  opacity = 0.3,
  className,
}: Omit<BlurOrbsProps, "orbs">) {
  return (
    <BlurOrbs
      orbs={defaultDashboardOrbs}
      opacity={opacity}
      className={className}/>
  );
}

/**
 * Subtle blur orbs for light backgrounds
 */
export function SubtleBlurOrbs({
  context = "marketing",
  className,
}: {
  context?: "marketing" | "dashboard";
  className?: string;
}) {
  const orbs = context === "marketing" ? defaultMarketingOrbs : defaultDashboardOrbs;

  return (
    <BlurOrbs
      orbs={orbs.map((orb) => ({
        ...orb,
        blur: (orb.blur ?? 80) * 1.5,
      }))}
      opacity={0.15}
      className={className}/>
  );
}


