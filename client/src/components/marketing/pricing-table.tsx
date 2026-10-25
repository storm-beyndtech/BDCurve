import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
}

export interface PricingFee {
  label: string;
  description?: string;
  fee: string;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  showCustom?: boolean;
  fees?: PricingFee[];
}

export function PricingTable({ plans, showCustom = true, fees }: PricingTableProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Badge variant="glass" className="shadow-depth">
          Issuance fees
        </Badge>
        <p className="text-sm text-muted-foreground">
          BTC-denominated pricing for card issuing and gateway rails—matched to instantsglobal-p.com/pricing.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const price = plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              variant={plan.highlighted ? "elevated" : "glass"}
              hover={plan.highlighted ? "glow" : "lift"}
              className={cn(
                "relative",
                plan.highlighted && "border-primary-500/30 shadow-depth-lg"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" className="shadow-depth">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">
                      {price} BTC
                    </span>
                    <span className="text-sm text-muted-foreground">per card issuance</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gateway access, auth, and support included. No hidden surcharges.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full gap-2 group"
                  size="lg"
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
                </Button>

                {/* Features */}
                <div className="space-y-3 pt-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0"/>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Itemized Fees */}
      {fees && fees.length > 0 && (
        <div className="w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 via-card/70 to-card/60 shadow-depth-lg backdrop-blur-sm">
          <div className="relative px-4 py-8 md:px-10 md:py-12 border-b border-border/70 bg-gradient-to-r from-primary-500/5 via-transparent to-accent-500/5">
            <div className="relative z-10 space-y-3">
              <Badge variant="glass" className="shadow-depth">
                Transparent Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Payment options & fees</h2>
              <p className="text-muted-foreground max-w-3xl text-lg">
                Itemized rates for every rail we support—transparent BTC pricing with no hidden surcharges.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-0"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
            {fees.map((item, index) => (
              <div
                key={item.label}
                className="group relative flex items-start gap-4 px-4 py-6 md:px-10 md:py-8 hover:bg-primary-500/5 transition-all duration-300"
              >
                <div className="mt-1 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-5 w-5 text-primary-500"/>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-bold text-foreground group-hover:text-primary-600 transition-colors">
                      {item.label}
                    </p>
                    <span className="text-lg font-bold text-primary-600 whitespace-nowrap px-3 py-1 rounded-lg bg-primary-500/10">
                      {item.fee}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-500"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Pricing */}
      {showCustom && (
        <Card variant="glass" padding="lg" className="text-center max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Need a custom solution?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For businesses processing over $10M annually or requiring
              dedicated support, custom infrastructure, or specialized
              integrations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button variant="primary" size="lg" className="gap-2">
                Contact sales
                <ArrowRight className="h-4 w-4"/>
              </Button>
              <Button variant="outline" size="lg">
                Schedule a demo
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


