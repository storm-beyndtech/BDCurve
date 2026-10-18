import * as React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

export interface MarketingLayoutProps {
  children: React.ReactNode;
  /**
   * Add ambient gradient background to the page
   */
  withAmbientGradient?: boolean;
  /**
   * Custom background visual layers (e.g., grid, mesh, floating elements)
   */
  backgroundLayers?: React.ReactNode;
  /**
   * Additional className for the main content area
   */
  className?: string;
  /**
   * Remove default padding from main content
   */
  noPadding?: boolean;
}

export function MarketingLayout({
  children,
  withAmbientGradient = false,
  backgroundLayers,
  className,
  noPadding = true,
}: MarketingLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Background Layers */}
      {(withAmbientGradient || backgroundLayers) && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Ambient gradient */}
          {withAmbientGradient && (
            <div className="absolute inset-0 bg-ambient-marketing opacity-50"/>
          )}

          {/* Custom background layers */}
          {backgroundLayers}
        </div>
      )}

      {/* Header */}
      <SiteHeader/>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-x-hidden",
          !noPadding && "container-wide container-padding",
          className
        )}
      >
        {children}
      </main>

      {/* Footer removed per request */}
    </div>
  );
}

/**
 * Simplified marketing page wrapper without background layers
 */
export function SimpleMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <SiteHeader/>
      <main className="flex-1 overflow-x-hidden">{children}</main>
      {/* Footer removed per request */}
    </div>
  );
}
