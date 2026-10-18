import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MarqueeRowProps {
  /**
   * Items to display in the marquee
   */
  children: React.ReactNode;
  /**
   * Direction of the marquee
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * Duration of one complete loop in seconds
   * @default 35
   */
  duration?: number;
  /**
   * Pause animation on hover
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Optional className for the row
   */
  className?: string;
  /**
   * Number of times to duplicate content for seamless loop
   * @default 2
   */
  duplicates?: number;
}

export function MarqueeRow({
  children,
  direction = "left",
  duration = 35,
  pauseOnHover = true,
  className,
  duplicates = 2,
}: MarqueeRowProps) {
  const [isPaused, setIsPaused] = React.useState(false);

  // Convert children to array for duplication
  const childrenArray = React.Children.toArray(children);

  // Create duplicated content for seamless loop
  const duplicatedChildren = Array.from({ length: duplicates + 1 })
    .flatMap(() => childrenArray);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        className="flex items-center gap-0"
        animate={{
          x: direction === "left" ? [0, "-50%"] : ["-50%", 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: duration,
            ease: "linear",
          },
        }}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {duplicatedChildren}
      </motion.div>
    </div>
  );
}

/**
 * Gradient fade overlay for marquee edges
 */
export function MarqueeFade({
  side = "both",
  className,
}: {
  side?: "left" | "right" | "both";
  className?: string;
}) {
  return (
    <>
      {(side === "left" || side === "both") && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none",
            className
          )}/>
      )}
      {(side === "right" || side === "both") && (
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none",
            className
          )}/>
      )}
    </>
  );
}

/**
 * MarqueeRow with built-in fade effect
 */
export function MarqueeRowWithFade({
  children,
  direction = "left",
  duration = 35,
  pauseOnHover = true,
  className,
  duplicates = 2,
  fadeSide = "both",
}: MarqueeRowProps & { fadeSide?: "left" | "right" | "both" }) {
  return (
    <div className="relative">
      <MarqueeRow
        direction={direction}
        duration={duration}
        pauseOnHover={pauseOnHover}
        className={className}
        duplicates={duplicates}
      >
        {children}
      </MarqueeRow>
      <MarqueeFade side={fadeSide}/>
    </div>
  );
}


