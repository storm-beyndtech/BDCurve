import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MarqueeItemProps {
  /**
   * Item content
   */
  children: React.ReactNode;
  /**
   * Optional className
   */
  className?: string;
}

export function MarqueeItem({ children, className }: MarqueeItemProps) {
  return (
    <motion.div
      className={cn(
        "flex-shrink-0 flex items-center justify-center",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Logo wrapper for marquee
 */
export function MarqueeLogo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <MarqueeItem className={cn("px-8", className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="max-w-full h-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"/>
    </MarqueeItem>
  );
}

/**
 * Review card wrapper for marquee
 */
export function MarqueeReview({
  author,
  role,
  company,
  content,
  rating = 5,
  avatar,
  className,
}: {
  author: string;
  role?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
  className?: string;
}) {
  return (
    <MarqueeItem className={cn("px-4", className)}>
      <div className="w-80 p-6 rounded-xl bg-glass-card border-glass shadow-glass backdrop-blur-xl">
        <div className="space-y-4">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground/30 fill-muted-foreground/30"
                )}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/90 leading-relaxed">
            "{content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            {avatar ? (
              <img
                src={avatar}
                alt={author}
                className="w-10 h-10 rounded-full object-cover"/>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {author.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{author}</p>
              {(role || company) && (
                <p className="text-xs text-muted-foreground truncate">
                  {role}
                  {role && company && " â€¢ "}
                  {company}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MarqueeItem>
  );
}

/**
 * Metric card wrapper for marquee
 */
export function MarqueeMetric({
  value,
  label,
  icon,
  className,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <MarqueeItem className={cn("px-4", className)}>
      <div className="w-64 p-6 rounded-xl bg-glass-card border-glass shadow-glass backdrop-blur-xl">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </div>
    </MarqueeItem>
  );
}


