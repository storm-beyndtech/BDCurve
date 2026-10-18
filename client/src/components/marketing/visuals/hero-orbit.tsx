import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HeroOrbitProps {
  /**
   * Size preset
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
  /**
   * Opacity level
   * @default 0.6
   */
  opacity?: number;
  /**
   * Additional className
   */
  className?: string;
}

const sizePresets = {
  sm: [150, 200, 250],
  default: [180, 250, 320],
  lg: [220, 300, 380],
};

/**
 * Reusable circular orbital motif from the hero
 * Use this component to maintain visual consistency across sections
 */
export function HeroOrbit({ size = "default", opacity = 0.6, className }: HeroOrbitProps) {
  const radii = sizePresets[size];

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg
        className="absolute"
        style={{
          left: "55%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Outer orbit - slowest */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radii[2]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="8 12"
          strokeLinecap="round"
          className="text-primary-500/40 dark:text-primary-400/30"
          style={{ opacity: opacity * 0.5 }}
          animate={{
            rotate: 360,
            strokeDashoffset: [-100, 0],
          }}
          transition={{
            rotate: {
              duration: 58,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
            strokeDashoffset: {
              duration: 29,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
          }}/>

        {/* Middle orbit - medium speed */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radii[1]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 6"
          strokeLinecap="round"
          className="text-primary-500/40 dark:text-primary-400/30"
          style={{ opacity: opacity * 0.7 }}
          animate={{
            rotate: -360,
            strokeDashoffset: [0, 100],
          }}
          transition={{
            rotate: {
              duration: 38,
              delay: 2,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
            strokeDashoffset: {
              duration: 19,
              delay: 2,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
          }}/>

        {/* Inner orbit - fastest */}
        <motion.circle
          cx="50%"
          cy="50%"
          r={radii[0]}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 6"
          strokeLinecap="round"
          className="text-primary-500/40 dark:text-primary-400/30"
          style={{ opacity: opacity * 0.9 }}
          animate={{
            rotate: 360,
            strokeDashoffset: [-100, 0],
          }}
          transition={{
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
            strokeDashoffset: {
              duration: 15,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
            },
          }}/>
      </svg>

      {/* Decorative pulsing center dot */}
      <motion.div
        className="absolute"
        style={{
          left: "55%",
          top: "45%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-primary-500/50 dark:bg-primary-400/40"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}/>
      </motion.div>
    </div>
  );
}


