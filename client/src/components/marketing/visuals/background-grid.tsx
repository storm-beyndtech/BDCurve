import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BackgroundGridProps {
  /**
   * Grid pattern type
   * @default "dots"
   */
  variant?: "dots" | "lines" | "squares";
  /**
   * Size of grid cells (in pixels)
   * @default 32
   */
  cellSize?: number;
  /**
   * Opacity of grid elements
   * @default 0.3
   */
  opacity?: number;
  /**
   * Enable fade effect on edges
   * @default true
   */
  fade?: boolean;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Animate grid on mount
   * @default true
   */
  animate?: boolean;
}

export function BackgroundGrid({
  variant = "dots",
  cellSize = 32,
  opacity = 0.3,
  fade = true,
  className,
  animate = true,
}: BackgroundGridProps) {
  const maskImage = fade
    ? "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)"
    : undefined;

  const webkitMaskImage = fade
    ? "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)"
    : undefined;

  // SVG patterns for different variants
  const renderPattern = () => {
    switch (variant) {
      case "dots":
        return (
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid-dots"
                width={cellSize}
                height={cellSize}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx={cellSize / 2}
                  cy={cellSize / 2}
                  r="1.5"
                  fill="currentColor"
                  opacity={opacity}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dots)"/>
          </svg>
        );

      case "lines":
        return (
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid-lines"
                width={cellSize}
                height={cellSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity={opacity}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-lines)"/>
          </svg>
        );

      case "squares":
        return (
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid-squares"
                width={cellSize}
                height={cellSize}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="1"
                  y="1"
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity={opacity}/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-squares)"/>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={cn(
        "absolute inset-0 pointer-events-none",
        "text-foreground/20 dark:text-foreground/10",
        className
      )}
      style={{
        maskImage,
        WebkitMaskImage: webkitMaskImage,
      }}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {renderPattern()}
    </motion.div>
  );
}

/**
 * Animated grid with subtle wave effect
 */
export function BackgroundGridWave({
  variant = "dots",
  cellSize = 32,
  opacity = 0.3,
  className,
}: Omit<BackgroundGridProps, "animate" | "fade">) {
  return (
    <motion.div
      className={cn(
        "absolute inset-0 pointer-events-none",
        "text-foreground/20 dark:text-foreground/10",
        className
      )}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
      animate={{
        y: [0, -cellSize, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <BackgroundGrid
        variant={variant}
        cellSize={cellSize}
        opacity={opacity}
        fade={false}
        animate={false}/>
    </motion.div>
  );
}


