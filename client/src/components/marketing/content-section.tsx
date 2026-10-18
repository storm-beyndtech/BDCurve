import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ContentSectionProps {
  title?: string;
  description?: string;
  paragraphs?: string[];
  badge?: string;
  className?: string;
  /**
   * Animation variant
   * @default "fade-up"
   */
  variant?: "fade-up" | "fade-in" | "none";
  /**
   * Text alignment
   * @default "left"
   */
  align?: "left" | "center" | "right";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

/**
 * ContentSection - A reusable component for displaying text content in readable chunks
 * Perfect for about sections, feature descriptions, and informational content
 */
export function ContentSection({
  title,
  description,
  paragraphs = [],
  badge,
  className,
  variant = "fade-up",
  align = "left",
}: ContentSectionProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const content = (
    <div
      className={cn(
        "space-y-6",
        alignmentClasses[align],
        className
      )}
    >
      {badge && (
        <motion.div
          className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm font-medium text-primary-600"
          variants={variant !== "none" ? itemVariants : undefined}
        >
          {badge}
        </motion.div>
      )}

      {title && (
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          variants={variant !== "none" ? itemVariants : undefined}
        >
          {title}
        </motion.h2>
      )}

      {description && (
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed"
          variants={variant !== "none" ? itemVariants : undefined}
        >
          {description}
        </motion.p>
      )}

      {paragraphs.length > 0 && (
        <div className="space-y-4 max-w-3xl">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed"
              variants={variant !== "none" ? itemVariants : undefined}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      )}
    </div>
  );

  if (variant === "none") {
    return content;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {content}
    </motion.div>
  );
}


