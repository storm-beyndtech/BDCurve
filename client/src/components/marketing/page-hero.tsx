import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BackgroundGrid,
  MarketingBlurOrbs,
  CompactOrbitalLines,
} from "@/components/marketing/visuals";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  /**
   * Category badge text
   */
  badge?: string;
  /**
   * Badge variant
   */
  badgeVariant?: "default" | "accent" | "glass";
  /**
   * Main headline
   */
  headline: string;
  /**
   * Highlighted part of headline (gradient)
   */
  headlineHighlight?: string;
  /**
   * Subheadline text
   */
  subheadline: string;
  /**
   * Primary CTA configuration
   */
  primaryCTA?: {
    label: string;
    href: string;
  };
  /**
   * Secondary CTA configuration
   */
  secondaryCTA?: {
    label: string;
    href: string;
  };
  /**
   * Trust indicators to display below CTAs
   */
  trustIndicators?: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  /**
   * Right side visual asset
   */
  visualAsset?: React.ReactNode;
  /**
   * Hero variant
   */
  variant?: "default" | "minimal" | "compact";
  /**
   * Custom className
   */
  className?: string;
}

export function PageHero({
  badge,
  badgeVariant = "default",
  headline,
  headlineHighlight,
  subheadline,
  primaryCTA,
  secondaryCTA,
  trustIndicators,
  visualAsset,
  variant = "default",
  className,
}: PageHeroProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const minHeight = variant === "compact" ? "min-h-[60vh]" : variant === "minimal" ? "min-h-[70vh]" : "min-h-[85vh]";

  return (
    <section className={cn("relative flex items-center py-20 lg:py-0", minHeight, className)}>
      {/* Background Visual Layers */}
      <div className="absolute inset-0 -z-10">
        {/* Large Grid at Bottom Right, Fading to Top Left */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -bottom-32 -right-32 w-[140%] h-[140%]"
            style={{
              maskImage: "linear-gradient(135deg, transparent 0%, black 30%, black 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(135deg, transparent 0%, black 30%, black 70%, transparent 100%)",
            }}
          >
            <BackgroundGrid variant="dots" cellSize={48} opacity={0.25}/>
          </div>
        </div>

        <MarketingBlurOrbs opacity={0.25}/>

        {/* Bolder, Weirder Orbital Lines */}
        <div className="absolute inset-0 opacity-60">
          <CompactOrbitalLines parallax={true} parallaxIntensity={0.8}/>
        </div>
      </div>

      {/* Content Container */}
      <motion.div
        className="container-wide container-padding"
        style={{ opacity: variant === "minimal" ? 1 : opacity }}
      >
        <div className={cn(
          "grid grid-cols-1 gap-16 items-center",
          visualAsset ? "lg:grid-cols-2 lg:gap-24" : "lg:grid-cols-1"
        )}>
          {/* Left Column: Content */}
          <motion.div
            className={cn(
              "space-y-10 z-10",
              !visualAsset && "max-w-3xl mx-auto text-center"
            )}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge
                  variant={badgeVariant}
                  className="shadow-depth gap-2 px-4 py-1.5"
                >
                  {badge}
                </Badge>
              </motion.div>
            )}

            {/* Main Headline */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                {headline}{" "}
                {headlineHighlight && (
                  <span className="text-primary-600">
                    {headlineHighlight}
                  </span>
                )}
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              className={cn(
                "text-lg md:text-xl text-muted-foreground leading-relaxed",
                visualAsset ? "max-w-xl" : "max-w-2xl mx-auto"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subheadline}
            </motion.p>

            {/* CTA Buttons */}
            {(primaryCTA || secondaryCTA) && (
              <motion.div
                className={cn(
                  "flex flex-col sm:flex-row gap-4",
                  !visualAsset && "justify-center"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {primaryCTA && (
                  <Button
                    variant="primary"
                    size="xl"
                    className="gap-2 group"
                    asChild
                  >
                    <a href={primaryCTA.href}>
                      <span>{primaryCTA.label}</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
                    </a>
                  </Button>
                )}

                {secondaryCTA && (
                  <Button
                    variant="glass"
                    size="xl"
                    className="gap-2 shadow-depth hover:shadow-depth-md"
                    asChild
                  >
                    <a href={secondaryCTA.href}>
                      <span>{secondaryCTA.label}</span>
                    </a>
                  </Button>
                )}
              </motion.div>
            )}

            {/* Trust Indicators */}
            {trustIndicators && trustIndicators.length > 0 && (
              <motion.div
                className={cn(
                  "flex flex-wrap items-center gap-6 pt-4",
                  !visualAsset && "justify-center"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {trustIndicators.map((indicator, index) => (
                  <motion.div
                    key={indicator.text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10">
                      <indicator.icon className="h-4 w-4 text-primary-600"/>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {indicator.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Visual Asset */}
          {visualAsset && (
            <motion.div
              className="relative hidden lg:block h-[700px] -mr-20"
              style={{ y }}
            >
              {/* Ambient Background */}
              <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-primary-500/3 to-transparent"/>
              <div className="absolute inset-0 bg-gradient-radial from-accent-500/6 via-transparent to-transparent"/>

              {/* Visual Asset */}
              <div className="absolute inset-0 scale-110">
                {visualAsset}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"/>
    </section>
  );
}

/**
 * Compact hero for secondary pages
 */
export function PageHeroCompact({
  badge,
  badgeVariant = "default",
  headline,
  headlineHighlight,
  subheadline,
  className,
}: Pick<PageHeroProps, "badge" | "badgeVariant" | "headline" | "headlineHighlight" | "subheadline" | "className">) {
  return (
    <section className={cn("relative min-h-[50vh] flex items-center py-16", className)}>
      {/* Background Visual Layers */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -bottom-32 -right-32 w-[140%] h-[140%]"
            style={{
              maskImage: "linear-gradient(135deg, transparent 0%, black 30%, black 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(135deg, transparent 0%, black 30%, black 70%, transparent 100%)",
            }}
          >
            <BackgroundGrid variant="dots" cellSize={48} opacity={0.15}/>
          </div>
        </div>
        <MarketingBlurOrbs opacity={0.15}/>
      </div>

      {/* Content */}
      <div className="container-wide container-padding">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {badge && (
            <Badge variant={badgeVariant} className="shadow-depth gap-2 px-4 py-1.5">
              {badge}
            </Badge>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            {headline}{" "}
            {headlineHighlight && (
              <span className="text-primary-600">
                {headlineHighlight}
              </span>
            )}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        </motion.div>
      </div>
    </section>
  );
}


