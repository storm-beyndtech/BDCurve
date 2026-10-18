import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Terminal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeveloperHeroProps {
  /**
   * Badge text
   */
  badge?: string;
  /**
   * Main headline
   */
  headline: string;
  /**
   * Highlighted portion of headline
   */
  highlightedText?: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Primary CTA
   */
  primaryAction: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /**
   * Secondary CTA
   */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /**
   * Code preview content
   */
  codePreview?: React.ReactNode;
  /**
   * Show gradient background
   * @default true
   */
  showGradient?: boolean;
}

export function DeveloperHero({
  badge = "Developer APIs",
  headline,
  highlightedText,
  description,
  primaryAction,
  secondaryAction,
  codePreview,
  showGradient = true,
}: DeveloperHeroProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.5]);

  return (
    <section className="relative overflow-hidden">
      {/* Premium Gradient Background */}
      {showGradient && (
        <>
          {/* Dark mode gradient */}
          <div className="absolute inset-0 -z-10 dark:opacity-100 opacity-0 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 via-transparent to-primary-500/10"/>
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl"/>
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"/>
          </div>

          {/* Light mode gradient */}
          <div className="absolute inset-0 -z-10 dark:opacity-0 opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-100 via-transparent to-primary-50"/>
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-accent-200/50 rounded-full blur-3xl"/>
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"/>
          </div>
        </>
      )}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}/>
      </div>

      <div className="container-wide container-padding section-spacing-lg">
        <motion.div
          style={{ y, opacity }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Column: Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="glass" className="shadow-depth">
                <Code className="h-3 w-3 mr-1.5"/>
                {badge}
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-display-xl font-bold tracking-tight">
                {headline}{" "}
                {highlightedText && (
                  <span className="text-accent-600">
                    {highlightedText}
                  </span>
                )}
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl">
                {description}
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              {primaryAction.href ? (
                <a href={primaryAction.href}>
                  <Button
                    variant="primary-purple"
                    size="xl"
                    className="gap-2 group"
                  >
                    {primaryAction.label}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
                  </Button>
                </a>
              ) : (
                <Button
                  variant="primary-purple"
                  size="xl"
                  className="gap-2 group"
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.label}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
                </Button>
              )}

              {secondaryAction && (
                <>
                  {secondaryAction.href ? (
                    <a href={secondaryAction.href}>
                      <Button variant="glass" size="xl" className="shadow-depth">
                        {secondaryAction.label}
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="glass"
                      size="xl"
                      className="shadow-depth"
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.label}
                    </Button>
                  )}
                </>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-600"/>
                <span className="text-sm text-muted-foreground">
                  99.99% uptime SLA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent-600"/>
                <span className="text-sm text-muted-foreground">
                  8+ language SDKs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-accent-600"/>
                <span className="text-sm text-muted-foreground">
                  RESTful API
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Code Preview */}
          {codePreview && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-2xl blur-2xl opacity-50"/>

              {/* Code Preview Container */}
              <div className="relative">{codePreview}</div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Compact developer hero for smaller sections
 */
export function DeveloperHeroCompact({
  headline,
  description,
  primaryAction,
}: Pick<
  DeveloperHeroProps,
  "headline" | "description" | "primaryAction"
>) {
  return (
    <div className="text-center space-y-6 py-12">
      <h2 className="text-3xl font-bold tracking-tight">{headline}</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
      {primaryAction.href ? (
        <a href={primaryAction.href}>
          <Button variant="primary-purple" size="lg" className="gap-2 group">
            {primaryAction.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
          </Button>
        </a>
      ) : (
        <Button
          variant="primary-purple"
          size="lg"
          className="gap-2 group"
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
        </Button>
      )}
    </div>
  );
}


