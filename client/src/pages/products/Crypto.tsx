import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric";
import { UseCaseSection } from "@/components/marketing/use-case-section";
import { ProductHeroOverkill } from "@/components/marketing/product-hero-overkill";
import { FluidCryptoVisual } from "@/components/marketing/visuals";
import { getProductById } from "@/lib/products";
import {
  ArrowRight,
  CheckCircle2,
  Bitcoin,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";

export default function CryptoPage() {
  const product = getProductById("crypto");

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <ProductHeroOverkill
        badge="CRYPTOCURRENCY"
        badgeIcon={Bitcoin}
        headline="Trade crypto 24/7"
        headlineHighlight="true ownership"
        subheadline="Buy, sell, and trade 40+ cryptocurrencies around the clock. From Bitcoin and Ethereum to emerging altcoins, with true ownership and no transfer fees."
        primaryCTA={{
          label: "Start trading crypto",
          href: "/signup",
        }}
        secondaryCTA={{
          label: "Explore crypto",
          href: "/demo",
        }}
        trustIndicators={[
          { icon: Shield, text: "NYSDFS Licensed" },
          { icon: DollarSign, text: "No transfer fees" },
          { icon: Zap, text: "24/7 trading" },
        ]}
        customVisual={FluidCryptoVisual}
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
                Complete cryptocurrency platform
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trade Bitcoin, Ethereum, and 40+ cryptocurrencies with true
                ownership, staking rewards, and institutional-grade security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.features.map((feature, index) => (
                <Card key={index} variant="elevated" padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-500/10 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-accent-600" />
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
                Crypto for every strategy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're a long-term holder, active trader, or yield
                seeker, our crypto platform supports your goals.
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
                Ready to join the crypto revolution?
              </h2>
              <p className="text-lg text-muted-foreground">
                Trade 40+ cryptocurrencies 24/7 with true ownership and no
                transfer fees. Start with as little as $1.
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
