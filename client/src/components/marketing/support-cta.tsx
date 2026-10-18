import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Mail, BookOpen, Calendar, ArrowRight } from "lucide-react";

export interface SupportCTAProps {
  /**
   * Show all support options
   * @default true
   */
  showAllOptions?: boolean;
  /**
   * Card variant
   * @default "glass"
   */
  variant?: "glass" | "elevated" | "default";
}

export function SupportCTA({
  showAllOptions = true,
  variant = "glass",
}: SupportCTAProps) {
  return (
    <Card variant={variant} padding="lg">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Need help?</h3>
          <p className="text-muted-foreground">
            Our team is here to help you get started and succeed with
            Bounding Curve.
          </p>
        </div>

        {showAllOptions ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/contact" className="group">
              <div className="p-4 rounded-lg border border-border hover:border-primary-500/50 transition-all hover:shadow-depth">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-primary-600"/>
                  </div>
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get instant answers
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <a
              href="mailto:support@boundingcurve.com"
              className="group"
            >
              <div className="p-4 rounded-lg border border-border hover:border-accent-500/50 transition-all hover:shadow-depth">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6 text-accent-600"/>
                  </div>
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      24h response time
                    </p>
                  </div>
                </div>
              </div>
            </a>

            <Link to="/about" className="group">
              <div className="p-4 rounded-lg border border-border hover:border-primary-500/50 transition-all hover:shadow-depth">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-primary-600"/>
                  </div>
                  <div>
                    <p className="font-medium">About Us</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Learn more about us
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/demo" className="group">
              <div className="p-4 rounded-lg border border-border hover:border-accent-500/50 transition-all hover:shadow-depth">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-accent-600"/>
                  </div>
                  <div>
                    <p className="font-medium">Book Demo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Personalized walkthrough
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="primary" size="lg" className="gap-2">
                Contact support
                <ArrowRight className="h-4 w-4"/>
              </Button>
            </Link>

            <Link to="/about">
              <Button variant="outline" size="lg">
                About Us
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Compact support CTA for sidebars or footers
 */
export function SupportCTACompact() {
  return (
    <div className="p-6 rounded-xl bg-glass-card border-glass">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary-600"/>
          </div>
          <div>
            <p className="font-semibold">Need help?</p>
            <p className="text-xs text-muted-foreground">
              We're here to assist
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link to="/contact">
            <Button variant="primary" size="sm" className="w-full">
              Contact support
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" size="sm" className="w-full">
              About Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

