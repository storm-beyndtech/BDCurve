import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OrbitalLineConfig {
  /**
   * Radius of the orbital ring (in pixels)
   */
  radius: number;
  /**
   * Stroke width (in pixels)
   * @default 1
   */
  strokeWidth?: number;
  /**
   * Stroke opacity
   * @default 0.2
   */
  opacity?: number;
  /**
   * Animation duration (in seconds)
   * @default 30
   */
  duration?: number;
  /**
   * Animation direction
   * @default "normal"
   */
  direction?: "normal" | "reverse";
  /**
   * Animation delay (in seconds)
   * @default 0
   */
  delay?: number;
}

export interface OrbitalLinesProps {
  /**
   * Array of orbital line configurations
   */
  orbitals?: OrbitalLineConfig[];
  /**
   * Enable parallax effect on scroll
   * @default true
   */
  parallax?: boolean;
  /**
   * Parallax intensity (multiplier for scroll distance)
   * @default 0.5
   */
  parallaxIntensity?: number;
  /**
   * Center position (percentage)
   */
  centerX?: number;
  centerY?: number;
  /**
   * Additional className
   */
  className?: string;
}

const defaultOrbitals: OrbitalLineConfig[] = [
  {
    radius: 200,
    strokeWidth: 1,
    opacity: 0.15,
    duration: 40,
    direction: "normal",
    delay: 0,
  },
  {
    radius: 300,
    strokeWidth: 1,
    opacity: 0.12,
    duration: 50,
    direction: "reverse",
    delay: 5,
  },
  {
    radius: 400,
    strokeWidth: 0.5,
    opacity: 0.08,
    duration: 60,
    direction: "normal",
    delay: 10,
  },
  {
    radius: 500,
    strokeWidth: 0.5,
    opacity: 0.05,
    duration: 70,
    direction: "reverse",
    delay: 15,
  },
];

export function OrbitalLines({
  orbitals = defaultOrbitals,
  parallax = true,
  parallaxIntensity = 0.5,
  centerX = 50,
  centerY = 50,
  className,
}: OrbitalLinesProps) {
  const { scrollYProgress } = useScroll();

  // Parallax transforms for orbital rings
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, parallax ? -200 * parallaxIntensity : 0]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, parallax ? 30 * parallaxIntensity : 0]
  );

  return (
    <motion.div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      style={{ y, rotate }}
    >
      <svg
        className="absolute"
        style={{
          left: `${centerX}%`,
          top: `${centerY}%`,
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
        }}
      >
        {orbitals.map((orbital, index) => (
          <motion.circle
            key={index}
            cx="50%"
            cy="50%"
            r={orbital.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={orbital.strokeWidth ?? 1}
            strokeDasharray={index % 2 === 0 ? "8 12" : "3 6"}
            strokeLinecap="round"
            className="text-primary-500/40 dark:text-primary-400/30"
            style={{ opacity: orbital.opacity ?? 0.2 }}
            animate={{
              rotate: orbital.direction === "reverse" ? -360 : 360,
              strokeDashoffset: [0, orbital.direction === "reverse" ? 100 : -100],
            }}
            transition={{
              rotate: {
                duration: orbital.duration ?? 30,
                delay: orbital.delay ?? 0,
                repeat: Infinity,
                ease: "linear",
              },
              strokeDashoffset: {
                duration: (orbital.duration ?? 30) * 0.5,
                delay: orbital.delay ?? 0,
                repeat: Infinity,
                ease: "linear",
              },
            }}/>
        ))}
      </svg>
    </motion.div>
  );
}

/**
 * Compact orbital lines for hero sections - Bolder & Weirder
 */
export function CompactOrbitalLines({
  parallax = true,
  parallaxIntensity = 0.6,
  className,
}: Omit<OrbitalLinesProps, "orbitals" | "centerX" | "centerY">) {
  const compactOrbitals: OrbitalLineConfig[] = [
    {
      radius: 180,
      strokeWidth: 2.5,
      opacity: 0.35,
      duration: 30,
      direction: "normal",
    },
    {
      radius: 250,
      strokeWidth: 2,
      opacity: 0.28,
      duration: 38,
      direction: "reverse",
      delay: 2,
    },
    {
      radius: 320,
      strokeWidth: 1.5,
      opacity: 0.22,
      duration: 48,
      direction: "normal",
      delay: 5,
    },
    {
      radius: 400,
      strokeWidth: 1,
      opacity: 0.15,
      duration: 58,
      direction: "reverse",
      delay: 8,
    },
  ];

  return (
    <OrbitalLines
      orbitals={compactOrbitals}
      parallax={parallax}
      parallaxIntensity={parallaxIntensity}
      centerX={55}
      centerY={45}
      className={className}/>
  );
}

/**
 * Large orbital lines for full-page backgrounds
 */
export function LargeOrbitalLines({
  parallax = true,
  className,
}: Omit<OrbitalLinesProps, "orbitals">) {
  const largeOrbitals: OrbitalLineConfig[] = [
    {
      radius: 300,
      strokeWidth: 1.5,
      opacity: 0.15,
      duration: 50,
      direction: "normal",
    },
    {
      radius: 450,
      strokeWidth: 1,
      opacity: 0.12,
      duration: 60,
      direction: "reverse",
      delay: 5,
    },
    {
      radius: 600,
      strokeWidth: 0.5,
      opacity: 0.08,
      duration: 70,
      direction: "normal",
      delay: 10,
    },
    {
      radius: 750,
      strokeWidth: 0.5,
      opacity: 0.05,
      duration: 80,
      direction: "reverse",
      delay: 15,
    },
  ];

  return (
    <OrbitalLines
      orbitals={largeOrbitals}
      parallax={parallax}
      className={className}/>
  );
}


