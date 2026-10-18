import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric";
import { UseCaseSection } from "@/components/marketing/use-case-section";
import { ProductHeroOverkill } from "@/components/marketing/product-hero-overkill";
import { FluidStockVisual } from "@/components/marketing/visuals";
import { getProductById } from "@/lib/products";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";

export default function StocksPage() {
  const product = getProductById("stocks");

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <ProductHeroOverkill
        badge="STOCK TRADING"
        badgeIcon={TrendingUp}
        headline="Trade 9,000+ stocks"
        headlineHighlight="commission-free"
        subheadline="Access thousands of US-listed stocks with zero commissions. Build your portfolio with fractional shares starting at just $1 and trade with confidence using AI-powered insights."
        primaryCTA={{
          label: "Start trading stocks",
          href: "/signup",
        }}
        secondaryCTA={{
          label: "Learn more",
          href: "/demo",
        }}
        trustIndicators={[
          { icon: Shield, text: "FINRA & SIPC Protected" },
          { icon: Zap, text: "Extended hours trading" },
          { icon: DollarSign, text: "From $1 minimum" },
        ]}
        customVisual={FluidStockVisual}
        visualBackground="minimal"
      />

      {/* Stats Section */}
      {product.stats && (
        <section className="section-spacing-md">
          <div className="container-wide container-padding">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {product.stats.map((stat, index) => (
                <MetricCard
                  key={index}
                  variant="glass"
                  label={stat.label}
                  value={stat.value}
                  description={stat.description}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="section-spacing-lg bg-muted/30">
        <div className="container-wide container-padding">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="accent" className="mb-4">
                Features
              </Badge>
              <h2 className="text-display-md font-bold mb-4">
                Everything you need to trade stocks
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Advanced trading tools, real-time data, and AI-powered insights
                to help you make smarter investment decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.features.map((feature, index) => (
                <Card key={index} variant="elevated" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/10 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <p className="text-sm font-medium pt-2">{feature}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section-spacing-lg">
        <div className="container-wide container-padding">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-display-md font-bold mb-4">
                Built for every type of investor
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're building wealth, chasing growth, or generating income, our stock trading platform has you covered.
              </p>
            </div>
            <UseCaseSection useCases={product.useCases} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing-lg">
        <div className="container-wide container-padding">
          <Card variant="glass" padding="lg">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-display-sm font-bold">
                Ready to start trading stocks?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join millions of investors trading commission-free on Bounding Curve.
                Get your first investment on us when you sign up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 group">
                    Get started now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    View documentation
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
