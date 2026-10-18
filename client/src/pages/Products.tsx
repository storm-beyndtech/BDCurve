import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/marketing";
import {
  BackgroundGrid,
  SubtleBlurOrbs,
} from "@/components/marketing/visuals";
import { ArrowRight } from "lucide-react";

export default function ProductsOverviewPage() {
  return (
    <div className="relative">
      {/* Background Visuals */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <BackgroundGrid variant="lines" cellSize={48} opacity={0.12} />
        <SubtleBlurOrbs context="marketing" />
      </div>

      {/* Hero Section */}
      <section className="section-spacing-lg">
        <div className="container-wide container-padding">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="glass" className="shadow-depth">
              Complete Platform
            </Badge>

            <h1 className="text-display-xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-primary-600">
                invest smarter
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive trading platform with stocks, ETFs, options, crypto, commodities,
              and professional tools to help you invest with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button variant="primary" size="xl" className="gap-2 group">
                Start investing now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button variant="glass" size="xl" className="shadow-depth">
                Schedule a demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-spacing-lg bg-muted/30">
        <div className="container-wide container-padding">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">
              Our Products
            </Badge>
            <h2 className="text-display-md font-bold mb-4">
              Built for modern businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible solutions that work independently or together as a
              complete platform for cross-border operations.
            </p>
          </div>

          <ProductGrid variant="elevated" showCTA={true} />
        </div>
      </section>

      {/* Integration Section */}
      <section className="section-spacing-lg">
        <div className="container-wide container-padding">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-display-md font-bold">
              Use products together or standalone
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product integrates seamlessly with the others. Start with
              what you need today and expand as your business grows.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
              <div className="p-6 rounded-xl bg-glass-card border-glass">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">1</span>
                  </div>
                  <h3 className="font-semibold">Open Accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with multi-currency accounts to hold and manage
                    balances across 50+ currencies.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-glass-card border-glass">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-accent-600">2</span>
                  </div>
                  <h3 className="font-semibold">Issue Cards</h3>
                  <p className="text-sm text-muted-foreground">
                    Add card issuing for employee expenses, vendor payments, or
                    subscription management.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-glass-card border-glass">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">3</span>
                  </div>
                  <h3 className="font-semibold">Scale Globally</h3>
                  <p className="text-sm text-muted-foreground">
                    Expand with payouts, FX management, and developer APIs as
                    your needs evolve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

