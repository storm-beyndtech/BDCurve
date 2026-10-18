import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FloatingCardConfig {
  /**
   * Card content (can be icon, text, or component)
   */
  content: React.ReactNode;
  /**
   * Initial position (percentage)
   */
  x: number;
  y: number;
  /**
   * Card width (in pixels)
   * @default 200
   */
  width?: number;
  /**
   * Card height (in pixels)
   * @default 120
   */
  height?: number;
  /**
   * Float animation duration (in seconds)
   * @default 6
   */
  duration?: number;
  /**
   * Float animation delay (in seconds)
   * @default 0
   */
  delay?: number;
  /**
   * Vertical float distance (in pixels)
   * @default 20
   */
  floatDistance?: number;
  /**
   * Rotation during animation (in degrees)
   * @default 2
   */
  rotation?: number;
}

export interface FloatingCardsProps {
  /**
   * Array of floating card configurations
   */
  cards: FloatingCardConfig[];
  /**
   * Card variant style
   * @default "glass"
   */
  variant?: "glass" | "elevated" | "subtle";
  /**
   * Additional className
   */
  className?: string;
}

export function FloatingCards({
  cards,
  variant = "glass",
  className,
}: FloatingCardsProps) {
  const getCardClasses = () => {
    switch (variant) {
      case "glass":
        return "bg-glass-card border-glass shadow-glass backdrop-blur-xl";
      case "elevated":
        return "bg-card border border-border shadow-elevated";
      case "subtle":
        return "bg-card/50 border border-border/50 shadow-depth";
      default:
        return "bg-glass-card border-glass shadow-glass backdrop-blur-xl";
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none",
        className
      )}
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute rounded-xl p-5 flex items-center justify-center",
            getCardClasses()
          )}
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            width: card.width ?? 200,
            height: card.height ?? 120,
          }}
          animate={{
            y: [0, -(card.floatDistance ?? 25), 0],
            rotate: [0, card.rotation ?? 3, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: card.duration ?? 6,
            delay: card.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.08,
            transition: { duration: 0.2 },
          }}
        >
          {card.content}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Stacked floating cards with stagger animation
 */
export function FloatingCardStack({
  cards,
  variant = "glass",
  className,
}: FloatingCardsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const getCardClasses = () => {
    switch (variant) {
      case "glass":
        return "bg-glass-card border-glass shadow-glass backdrop-blur-xl";
      case "elevated":
        return "bg-card border border-border shadow-elevated";
      case "subtle":
        return "bg-card/50 border border-border/50 shadow-depth";
      default:
        return "bg-glass-card border-glass shadow-glass backdrop-blur-xl";
    }
  };

  return (
    <motion.div
      className={cn("relative pointer-events-none", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-xl p-4 flex items-center justify-center mb-4",
            getCardClasses()
          )}
          style={{
            width: card.width ?? 200,
            height: card.height ?? 120,
          }}
          variants={cardVariants}
          animate={{
            y: [0, -(card.floatDistance ?? 15), 0],
            rotate: [0, card.rotation ?? 1, 0],
          }}
          transition={{
            y: {
              duration: card.duration ?? 5,
              delay: card.delay ?? index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: card.duration ?? 5,
              delay: card.delay ?? index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
        >
          {card.content}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Floating card grid with scattered positioning
 */
export function FloatingCardGrid({
  cards,
  variant = "glass",
  className,
}: FloatingCardsProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute rounded-xl p-4 flex items-center justify-center",
            variant === "glass" &&
              "bg-glass-card border-glass shadow-glass backdrop-blur-xl",
            variant === "elevated" &&
              "bg-card border border-border shadow-elevated",
            variant === "subtle" &&
              "bg-card/50 border border-border/50 shadow-depth"
          )}
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            width: card.width ?? 180,
            height: card.height ?? 100,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -(card.floatDistance ?? 15), 0],
            rotate: [
              0,
              (card.rotation ?? 2) * (index % 2 === 0 ? 1 : -1),
              0,
            ],
          }}
          transition={{
            opacity: { duration: 0.6, delay: index * 0.1 },
            scale: { duration: 0.6, delay: index * 0.1 },
            y: {
              duration: card.duration ?? 6,
              delay: card.delay ?? index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: card.duration ?? 6,
              delay: card.delay ?? index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          whileHover={{
            scale: 1.08,
            transition: { duration: 0.2 },
          }}
        >
          {card.content}
        </motion.div>
      ))}
    </div>
  );
}


